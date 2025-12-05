// ==UserScript==
// @name         Tradutor de templates EN→PT
// @description  Converte templates de referências e infoboxes do inglês para o português (inclui datas mais comuns).
// @version      0.1.0
// @author       Wilfredor
// ==/UserScript==
importScript('Usuário(a):Wilfredor/template configs.js');

(function () {
    if (typeof mw === 'undefined') return;
    const action = mw.config.get('wgAction');
    if (action !== 'edit' && action !== 'submit') return;

    const textarea = document.getElementById('wpTextbox1');
    if (!textarea) return;

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function parseDateParts(val) {
        const monthKeys = Object.keys(monthMap).sort((a, b) => b.length - a.length).join('|');
        const monthWordRe = new RegExp(`(^|[^\\p{L}])(${monthKeys})(?=$|[^\\p{L}])`, 'iu');
        const iso = /^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/;
        const dmy = /^(\d{1,2})\s+([A-Za-z\.]+)\s+(\d{4})$/;
        const mdy = /^([A-Za-z\.]+)\s+(\d{1,2}),?\s+(\d{4})$/;
        const my = /^([A-Za-z\.]+)\s+(\d{4})$/;

        function mmFromMonth(m) {
            const key = m.replace(/\./g, '').toLowerCase();
            const name = monthMap[key];
            if (!name) return null;
            const idx = monthsPt.indexOf(name);
            return idx >= 0 ? ('0' + (idx + 1)).slice(-2) : null;
        }

        let m;
        if ((m = val.match(iso))) {
            return { yyyy: m[1], mm: ('0' + m[2]).slice(-2), dd: ('0' + m[3]).slice(-2) };
        }
        if ((m = val.match(dmy))) {
            const mm = mmFromMonth(m[2]);
            if (!mm) return null;
            return { dd: ('0' + m[1]).slice(-2), mm, yyyy: m[3] };
        }
        if ((m = val.match(mdy))) {
            const mm = mmFromMonth(m[1]);
            if (!mm) return null;
            return { dd: ('0' + m[2]).slice(-2), mm, yyyy: m[3] };
        }
        if ((m = val.match(my))) {
            const mm = mmFromMonth(m[1]);
            return { dd: '', mm: mm || '', yyyy: m[2] };
        }
        if (monthWordRe.test(val)) {
            // fallback: try to replace month word and keep the rest
            const mmWord = val.match(monthWordRe)[2];
            const mm = mmFromMonth(mmWord);
            if (mm) return { dd: '', mm, yyyy: '' };
        }
        return null;
    }

    function stripLeadingZero(num) {
        if (!num) return '';
        const n = parseInt(num, 10);
        return isNaN(n) ? num : String(n);
    }

    function applyDateMask(parts, mask) {
        if (!parts) return null;
        const monthName = parts.mm ? monthsPt[parseInt(parts.mm, 10) - 1] || '' : '';
        const tokens = {
            YYYY: parts.yyyy || '',
            MM: stripLeadingZero(parts.mm),
            DD: stripLeadingZero(parts.dd),
            MONTH: monthName
        };
        return mask.replace(/YYYY|MM|DD|MONTH/g, (t) => tokens[t] || '');
    }

    function mapEnumValue(valueMap, rawValue) {
        if (!valueMap) return null;
        const trimmed = (rawValue || '').trim();
        if (!trimmed) return null;
        const lowered = trimmed.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(valueMap, trimmed)) {
            return valueMap[trimmed];
        }
        if (Object.prototype.hasOwnProperty.call(valueMap, lowered)) {
            return valueMap[lowered];
        }
        return null;
    }

    function sortMappedParams(mapped, cfg) {
        if (cfg && cfg.preserveOrder) {
            return mapped;
        }
        if (cfg && Array.isArray(cfg.paramOrder)) {
            const order = new Map();
            cfg.paramOrder.forEach((name, idx) => order.set(name, idx));
            return mapped.sort((a, b) => {
                const ai = order.has(a.name) ? order.get(a.name) : Number.MAX_SAFE_INTEGER;
                const bi = order.has(b.name) ? order.get(b.name) : Number.MAX_SAFE_INTEGER;
                if (ai !== bi) return ai - bi;
                return a.name.localeCompare(b.name, 'pt');
            });
        }
        return mapped.sort((a, b) => a.name.localeCompare(b.name, 'pt'));
    }

    function normalizeTplName(name) {
        return (name || '')
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function resolveParamCfg(cfgParams, origName) {
        if (!cfgParams) return null;
        const variants = [
            origName,
            origName.toLowerCase(),
            origName.replace(/_/g, '-'),
            origName.replace(/_/g, '-').toLowerCase()
        ];
        for (const v of variants) {
            if (Object.prototype.hasOwnProperty.call(cfgParams, v)) {
                return { paramCfg: cfgParams[v], mappedKey: v };
            }
        }
        return null;
    }

    function splitParamsSafe(content) {
        const parts = [];
        let buf = '';
        let tplDepth = 0;
        let linkDepth = 0;
        const len = content.length;
        for (let i = 0; i < len; i++) {
            const ch = content[i];
            const next = i + 1 < len ? content[i + 1] : '';
            if (ch === '{' && next === '{') {
                tplDepth += 1;
                buf += '{{';
                i += 1;
                continue;
            }
            if (ch === '}' && next === '}' && tplDepth > 0) {
                tplDepth -= 1;
                buf += '}}';
                i += 1;
                continue;
            }
            if (ch === '[' && next === '[') {
                linkDepth += 1;
                buf += '[[';
                i += 1;
                continue;
            }
            if (ch === ']' && next === ']' && linkDepth > 0) {
                linkDepth -= 1;
                buf += ']]';
                i += 1;
                continue;
            }
            if (ch === '|' && tplDepth === 0 && linkDepth === 0) {
                parts.push(buf);
                buf = '';
                continue;
            }
            buf += ch;
        }
        parts.push(buf);
        return parts;
    }

    function buildNameLookup() {
        const map = new Map();
        templateConfigs.forEach((cfg) => {
            (cfg.names || []).forEach((n) => {
                map.set(normalizeTplName(n), cfg);
            });
        });
        return map;
    }

    function findTemplates(text) {
        const matches = [];
        const len = text.length;
        const stack = [];
        for (let i = 0; i < len - 1; i++) {
            if (text[i] === '{' && text[i + 1] === '{') {
                stack.push(i);
                i += 1;
                continue;
            }
            if (text[i] === '}' && text[i + 1] === '}' && stack.length) {
                const start = stack.pop();
                const end = i + 2;
                matches.push({ start, end });
                i += 1;
            }
        }
        return matches;
    }

    const dateParamsPt = new Set([
        'data',
        'acessodata',
        'acessadoem',
        'arquivodata',
        'date',
        'ano',
        'mês',
        'dia',
        'birth_date',
        'death_date'
    ]);

    function translateTemplateContent(cfg, content) {
        if (cfg && cfg.passthrough) {
            const trimmedContent = content || '';
            const sep = trimmedContent ? '|' : '';
            return `{{${cfg.target}${sep}${trimmedContent}}}`;
        }
        // divide por parâmetros
        const parts = splitParamsSafe(content);
        const mapped = [];
        const others = [];
        const orderedParts = [];
        const dateSet = new Set([...(cfg.dateFields || []), ...dateParamsPt]);
        const positionalCfg = Array.isArray(cfg.positional) ? cfg.positional : [];
        let positionalIndex = 0;

        parts.forEach((part) => {
            // preserva o separador inicial
            const fullPart = '|' + part;
            const m = part.match(/^\s*([^\s=]+)\s*=\s*([\s\S]*)$/);
            if (!m) {
                const posCfg = positionalCfg[positionalIndex] || null;
                const value = part;
                const cleanValue = value.trim();
                if (!posCfg) {
                    others.push(fullPart);
                    orderedParts.push(fullPart);
                    positionalIndex += 1;
                    return;
                }
                const posName = posCfg.to || String(positionalIndex + 1);
                let mappedValue = value;
                if (posCfg.valueMap) {
                    const mappedEnum = mapEnumValue(posCfg.valueMap, cleanValue);
                    if (mappedEnum !== null && mappedEnum !== undefined) {
                        mappedValue = mappedEnum;
                    }
                }
                mapped.push({ name: posName, value: mappedValue });
                orderedParts.push('|' + posName + '=' + mappedValue);
                positionalIndex += 1;
                return;
            }
            const origName = m[1];
            const value = m[2];
            const cleanValue = value.trim();
            const resolved = resolveParamCfg(cfg.params, origName);
            const paramCfg = resolved ? resolved.paramCfg : undefined;
            const mappedKey = resolved ? resolved.mappedKey : origName;
            const isObjectCfg = paramCfg && typeof paramCfg === 'object';
            const mappedName = isObjectCfg ? (paramCfg.to || mappedKey) : (paramCfg || mappedKey);
            let mappedValue = value;
            if (isObjectCfg && paramCfg.mask) {
                const dateParts = parseDateParts(cleanValue);
                const hasDayYear = dateParts && dateParts.dd && dateParts.yyyy;
                const masked = hasDayYear ? applyDateMask(dateParts, paramCfg.mask) : null;
                mappedValue = masked || normalizeDate(cleanValue) || value;
            } else if (dateSet.has(mappedName)) {
                const normalized = normalizeDate(cleanValue);
                mappedValue = normalized || value;
            }
            if (isObjectCfg && paramCfg.valueMap) {
                const mappedEnum = mapEnumValue(paramCfg.valueMap, cleanValue);
                if (mappedEnum !== null && mappedEnum !== undefined) {
                    mappedValue = mappedEnum;
                }
            }
            mapped.push({ name: mappedName, value: mappedValue });
            orderedParts.push('|' + mappedName + '=' + mappedValue);
        });

        let rebuilt;
        if (cfg && cfg.preserveOrder) {
            // mantém a ordem original (mapped/posicionais/outros na sequência lida)
            rebuilt = `{{${cfg.target}` + orderedParts.join('') + '}}';
        } else {
            const sorted = sortMappedParams(mapped, cfg);
            rebuilt = `{{${cfg.target}`;
            sorted.forEach(({ name, value }) => {
                rebuilt += '|' + name + '=' + value;
            });
            others.forEach((p) => {
                rebuilt += p;
            });
            rebuilt += '}}';
        }
        if (cfg.singleLine) {
            rebuilt = rebuilt.replace(/\r?\n\s*/g, ' ');
        }
        return rebuilt;
    }

    function applyTemplateConfigs(text) {
        const nameLookup = buildNameLookup();
        let output = text;
        let changed = false;
        let guard = 0;

        while (guard < 200) {
            const matches = findTemplates(output);
            if (!matches.length) break;

            let replaced = false;
            for (let i = matches.length - 1; i >= 0; i--) {
                const { start, end } = matches[i];
                const raw = output.slice(start, end);
                const inner = raw.slice(2, -2);
                const nameMatch = inner.match(/^\s*([^|]+?)(\|[\s\S]*)?$/);
                if (!nameMatch) continue;
                const rawName = (nameMatch[1] || '').trim();
                const tplName = normalizeTplName(rawName);
                const cfg = nameLookup.get(tplName);
                if (!cfg) continue;
                const content = nameMatch[2] ? nameMatch[2].slice(1) : '';
                const translated = translateTemplateContent(cfg, content);
                if (translated === raw) {
                    // já traduzido ou sem mudanças; continue buscando outro
                    continue;
                }
                output = output.slice(0, start) + translated + output.slice(end);
                changed = true;
                replaced = true;
                break; // refaça o scan após cada substituição
            }

            if (!replaced) break;
            guard += 1;
        }

        return { text: output, changed };
    }

    const monthsPt = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const monthMap = {
        january: 'janeiro', jan: 'janeiro',
        february: 'fevereiro', feb: 'fevereiro',
        march: 'março', mar: 'março',
        april: 'abril', apr: 'abril',
        may: 'maio',
        june: 'junho', jun: 'junho',
        july: 'julho', jul: 'julho',
        august: 'agosto', aug: 'agosto',
        september: 'setembro', sep: 'setembro', sept: 'setembro',
        october: 'outubro', oct: 'outubro',
        november: 'novembro', nov: 'novembro',
        december: 'dezembro', dec: 'dezembro'
    };

    function normalizeDate(raw) {
        const val = (raw || '').trim();
        if (!val) return val;

        const monthRegex = Object.keys(monthMap).sort((a, b) => b.length - a.length).join('|');
        const month = new RegExp(`(^|[^\\p{L}])(${monthRegex})(?=$|[^\\p{L}])`, 'iu');

        const iso = /^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/;
        const dmy = /^(\d{1,2})\s+([A-Za-z\.]+)\s+(\d{4})$/;
        const mdy = /^([A-Za-z\.]+)\s+(\d{1,2}),?\s+(\d{4})$/;
        const my = /^([A-Za-z\.]+)\s+(\d{4})$/;

        function monthToNum(m) {
            const key = m.replace(/\./g, '').toLowerCase();
            if (/^\d{1,2}$/.test(key)) return parseInt(key, 10);
            const name = monthMap[key];
            if (!name) return null;
            const idx = monthsPt.indexOf(name);
            return idx >= 0 ? idx + 1 : null;
        }

        let m;
        if ((m = val.match(iso))) {
            const yyyy = m[1];
            const mm = parseInt(m[2], 10);
            const dd = parseInt(m[3], 10);
            const monthName = monthsPt[mm - 1] || mm;
            return `${dd} de ${monthName} de ${yyyy}`;
        }
        if ((m = val.match(dmy))) {
            const dd = parseInt(m[1], 10);
            const mm = monthToNum(m[2]);
            if (!mm) return val;
            const monthName = monthsPt[mm - 1] || mm;
            return `${dd} de ${monthName} de ${m[3]}`;
        }
        if ((m = val.match(mdy))) {
            const dd = parseInt(m[2], 10);
            const mm = monthToNum(m[1]);
            if (!mm) return val;
            const monthName = monthsPt[mm - 1] || mm;
            return `${dd} de ${monthName} de ${m[3]}`;
        }
        if ((m = val.match(my))) {
            const mm = monthToNum(m[1]);
            if (!mm) return val;
            const monthName = monthsPt[mm - 1] || mm;
            return `${monthName} de ${m[2]}`;
        }
        if (month.test(val)) {
            return val.replace(month, (full, prefix, mt) => {
                const mm = monthToNum(mt);
                const monthName = mm ? monthsPt[mm - 1] : null;
                return monthName ? `${prefix}${monthName}` : full;
            });
        }
        return val;
    }

    function translateDates(text) {
        const dateParams = ['data', 'acessodata', 'acessadoem', 'arquivodata', 'archive-date', 'access-date', 'date'];
        dateParams.forEach((p) => {
            const re = new RegExp('(\\|\\s*' + p + '\\s*=)([^|}\n]*)', 'ig');
            text = text.replace(re, function (_, k, v) {
                const novo = normalizeDate(v);
                return k + (novo || v);
            });
        });
        return text;
    }

    function translateCategoriesAndFiles(text) {
        // Categorias
        text = text.replace(/\[\[\s*Category\s*:/gi, '[[Categoria:');
        // Dead link
        text = text.replace(/\{\{\s*Dead link\s*\}\}/gi, '{{Ligação inativa}}');
        // Arquivos
        text = text.replace(/\[\[\s*File\s*:/gi, '[[Ficheiro:');
        // Ajusta atributos de imagem
        text = text.replace(/\|right\b/gi, '|direita');
        text = text.replace(/\|left\b/gi, '|esquerda');
        text = text.replace(/\|upright\b/gi, '|vertical');
        return text;
    }

    function convertNumberEnToPt(numStr) {
        // remove separadores de milhar com vírgula e troca o ponto decimal por vírgula
        const cleaned = numStr.replace(/,/g, '');
        const parts = cleaned.split('.');
        if (parts.length === 1) return cleaned;
        const decimal = parts.pop();
        const integer = parts.join('');
        return integer + ',' + decimal;
    }

    function translateNumbers(text) {
        return text.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, (m) => convertNumberEnToPt(m));
    }

    function translateTemplates(text) {
        // Aplica mapeamentos específicos por predefinição (inclui aninhadas)
        let changed = true;
        let safeGuard = 0;
        while (changed && safeGuard < 8) {
            const result = applyTemplateConfigs(text);
            text = result.text;
            changed = result.changed;
            safeGuard += 1;
        }
        text = translateDates(text);
        text = translateCategoriesAndFiles(text);
        text = translateNumbers(text);
        // Normaliza bloco de referências simples para a predefinição padrão
        text = text.replace(/\n==\s*Refer[eê]ncias\s*==\s*\n\s*\{\{\s*reflist\s*\}\}\s*/i, '\n{{Referências}}\n');
        return text;
    }

    function addButton() {
        const diffBtn = document.getElementById('wpDiff');
        const btn = document.createElement('input');
        btn.type = 'button';
        btn.className = diffBtn ? diffBtn.className : '';
        btn.id = 'traduzir-en-pt';
        btn.value = 'Traduzir EN→PT';
        btn.style.marginLeft = '6px';
        btn.addEventListener('click', function () {
            textarea.value = translateTemplates(textarea.value);
            const summary = document.getElementById('wpSummary');
            if (summary) {
                const note = 'tradução de templates EN→PT';
                if (summary.value && !summary.value.includes(note)) summary.value += ', ' + note;
                else if (!summary.value) summary.value = note;
            }
            if (diffBtn) diffBtn.click();
        });
        if (diffBtn && diffBtn.parentNode) {
            diffBtn.parentNode.insertBefore(btn, diffBtn.nextSibling);
        } else {
            textarea.parentNode.insertBefore(btn, textarea.nextSibling);
        }
    }

    addButton();
})();
