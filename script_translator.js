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

    let textarea = document.getElementById('wpTextbox1');
    let buttonsAdded = false;

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function parseDateParts(val) {
        const monthKeys = Object.keys(monthMap).sort((a, b) => b.length - a.length).join('|');
        const monthWordRe = new RegExp(`(^|[^\\p{L}])(${monthKeys})(?=$|[^\\p{L}])`, 'iu');
        const iso = /^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/;
        const dmy = /^(\d{1,2})\s+([\p{L}\.]+)\s+(\d{4})$/u;
        const mdy = /^([\p{L}\.]+)\s+(\d{1,2}),?\s+(\d{4})$/u;
        const my = /^([\p{L}\.]+)\s+(\d{4})$/u;
        const dmyPt = /^(\d{1,2})\s+de\s+([\p{L}\.]+)\s+de\s+(\d{4})$/iu;
        const hasDigits = /\d/.test(val);

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
        if ((m = val.match(dmyPt))) {
            const mm = mmFromMonth(m[2]);
            if (!mm) return null;
            return { dd: ('0' + m[1]).slice(-2), mm, yyyy: m[3] };
        }
        if (!hasDigits && monthWordRe.test(val)) {
            // fallback: try to replace month word and keep the rest
            const mmWord = val.match(monthWordRe)[2];
            const mm = mmFromMonth(mmWord);
            if (mm) return { dd: '', mm, yyyy: '' };
        }
        return null;
    }

    function applyDateMask(parts, mask) {
        if (!parts || !mask) return null;
        const dayNum = parts.dd ? parseInt(parts.dd, 10) : null;
        const monthNum = parts.mm ? parseInt(parts.mm, 10) : null;
        const dayNoPad = Number.isFinite(dayNum) ? String(dayNum) : '';
        const monthNoPad = Number.isFinite(monthNum) ? String(monthNum) : '';
        const monthName = monthNum ? monthsPt[monthNum - 1] || '' : '';
        const tokens = {
            YYYY: parts.yyyy || '',
            MM: parts.mm || '',
            DD: parts.dd || '',
            MONTH: monthName,
            dd: dayNoPad,
            mm: monthNoPad
        };
        return mask.replace(/YYYY|MONTH|MM|DD|mm|dd/g, (t) => tokens[t] || '');
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

    function preserveWhitespace(original, converted) {
        if (converted === null || converted === undefined) return original;
        const lead = (original.match(/^\s*/) || [''])[0];
        const trail = (original.match(/\s*$/) || [''])[0];
        return lead + converted + trail;
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

    function alignEquals(partsList) {
        const parsed = partsList.map((p) => {
            const body = p.replace(/^\|\s*/, '');
            const eqIdx = body.indexOf('=');
            if (eqIdx === -1) return { raw: body, name: null, value: null };
            return {
                name: body.slice(0, eqIdx).trim(),
                value: body.slice(eqIdx + 1).trim()
            };
        });
        const maxNameLen = parsed.reduce((max, item) => (item.name ? Math.max(max, item.name.length) : max), 0);
        const targetEqPos = maxNameLen + 1; // coluna onde o '=' deve ficar
        return parsed.map((item) => {
            if (!item.name) return '|' + item.raw.trim();
            const paddedName = item.name.padEnd(targetEqPos, ' ');
            return '|' + paddedName + '= ' + item.value;
        });
    }

    function buildNameLookup() {
        const map = new Map();
        templateConfigs.forEach((cfg) => {
            (cfg.names || []).forEach((n) => {
                map.set(normalizeTplName(n), cfg);
            });
            // permite reaplicar mapeamentos em predefinições já traduzidas (nome de destino)
            if (cfg.target) {
                map.set(normalizeTplName(cfg.target), cfg);
            }
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

    const DEFAULT_DATE_MASK = 'YYYY-MM-DD';

    function translateTemplateContent(cfg, content, originalName) {
        const targetName = originalName && cfg && cfg.target && normalizeTplName(originalName) === normalizeTplName(cfg.target)
            ? originalName.trim()
            : cfg.target;
        if (cfg && cfg.passthrough) {
            const trimmedContent = content || '';
            const sep = trimmedContent ? '|' : '';
            return `{{${targetName}${sep}${trimmedContent}}}`;
        }
        // divide por parâmetros
        const parts = splitParamsSafe(content);
        const mapped = [];
        const others = [];
        const orderedParts = [];
        const dateSet = new Set(cfg.dateFields || []);
        const paramMaskMap = new Map();
        if (cfg.params) {
            Object.entries(cfg.params).forEach(([key, cfgVal]) => {
                if (cfgVal && typeof cfgVal === 'object' && cfgVal.mask) {
                    const target = cfgVal.to || key;
                    paramMaskMap.set(target, cfgVal.mask);
                    dateSet.add(target);
                }
            });
        }
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
                if (!posCfg || cleanValue === '') {
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
            const isDateField = dateSet.has(mappedName) || (isObjectCfg && paramCfg.mask);
            const isLikelyUrl = /:\/\/\S+/.test(cleanValue) || /^www\./i.test(cleanValue);
            const hasDigits = /\d/.test(cleanValue);
            const hasLetters = /[A-Za-z]/.test(cleanValue);
            let mappedValue = value;
            const maskFromCfg = paramMaskMap.get(mappedName) || (isObjectCfg && paramCfg.mask ? paramCfg.mask : null);
            const mask = maskFromCfg || (isDateField ? DEFAULT_DATE_MASK : null);
            if (isDateField && !isLikelyUrl) {
                if (mask && (hasLetters || hasDigits)) {
                    const dateParts = parseDateParts(cleanValue);
                    const masked = dateParts ? applyDateMask(dateParts, mask) : null;
                    if (masked) {
                        mappedValue = preserveWhitespace(value, masked);
                    } else {
                        const normalized = normalizeDate(cleanValue);
                        mappedValue = normalized ? preserveWhitespace(value, normalized) : value;
                    }
                } else if (hasLetters) {
                    const normalized = normalizeDate(cleanValue);
                    mappedValue = normalized ? preserveWhitespace(value, normalized) : value;
                }
            }
            if (isObjectCfg && paramCfg.valueMap) {
                const mappedEnum = mapEnumValue(paramCfg.valueMap, cleanValue);
                if (mappedEnum !== null && mappedEnum !== undefined) {
                    mappedValue = preserveWhitespace(value, mappedEnum);
                }
            }
            if (cleanValue === '') {
                // remove campos vazios no processo de reparo
                return;
            }
            mapped.push({ name: mappedName, value: mappedValue });
            orderedParts.push('|' + mappedName + '=' + mappedValue);
        });

        function buildTemplate(partsList) {
            if (cfg && cfg.singleLine) {
                const cleaned = partsList.map((p) => p.replace(/^\|\s*/, '|'));
                const inline = cleaned.map((p) => p.replace(/\s+$/g, '')).join('');
                return `{{${targetName}${cleaned.length ? inline : ''}}}`;
            }
            const shouldAlign = (targetName || '').trim().toLowerCase().startsWith('info/');
            const normalized = shouldAlign
                ? alignEquals(partsList)
                : partsList.map((p) => {
                      const body = p.replace(/^\|\s*/, '').trim();
                      return '|' + body;
                  });
            return `{{${targetName}\n${normalized.join('\n')}\n}}`;
        }

        let rebuilt;
        if (cfg && cfg.preserveOrder) {
            // mantém a ordem original (mapped/posicionais/outros na sequência lida)
            rebuilt = buildTemplate(orderedParts);
        } else {
            const partsList = mapped.map(({ name, value }) => '|' + name + '=' + value).concat(others);
            rebuilt = buildTemplate(partsList);
        }
        return rebuilt;
    }

    function applyTemplateConfigs(text) {
        const nameLookup = buildNameLookup();
        let output = text;
        let changed = false;
        let count = 0;
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
                const translated = translateTemplateContent(cfg, content, rawName);
                if (translated === raw) {
                    // já traduzido ou sem mudanças; continue buscando outro
                    continue;
                }
                output = output.slice(0, start) + translated + output.slice(end);
                changed = true;
                count += 1;
                replaced = true;
                break; // refaça o scan após cada substituição
            }

            if (!replaced) break;
            guard += 1;
        }

        return { text: output, changed, count };
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
        december: 'dezembro', dec: 'dezembro',
        // português
        janeiro: 'janeiro',
        fevereiro: 'fevereiro', fev: 'fevereiro',
        'março': 'março', marco: 'março',
        abril: 'abril', abr: 'abril',
        maio: 'maio',
        junho: 'junho',
        julho: 'julho',
        agosto: 'agosto', ago: 'agosto',
        setembro: 'setembro', set: 'setembro',
        outubro: 'outubro', out: 'outubro',
        novembro: 'novembro',
        dezembro: 'dezembro', dez: 'dezembro'
    };

    function normalizeDate(raw) {
        const val = (raw || '').trim();
        if (!val) return val;
        // não tente converter datas dentro de URLs ou cadeias sem dígitos
        if (/^[a-z][a-z0-9+.-]*:\/\/\S+/i.test(val)) return val;
        const hasDigits = /\d/.test(val);

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
        if (hasDigits && month.test(val)) {
            return val.replace(month, (full, prefix, mt) => {
                const mm = monthToNum(mt);
                const monthName = mm ? monthsPt[mm - 1] : null;
                return monthName ? `${prefix}${monthName}` : full;
            });
        }
        return val;
    }

    function alignInfoTemplates(text) {
        let output = text;
        let changed = false;
        let guard = 0;
        while (guard < 100) {
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
                if (!/^info\//i.test(rawName)) continue;
                const content = nameMatch[2] ? nameMatch[2].slice(1) : '';
                const parts = splitParamsSafe(content);
                const aligned = alignEquals(parts);
                const rebuilt = `{{${rawName}\n${aligned.join('\n')}\n}}`;
                if (rebuilt === raw) continue;
                output = output.slice(0, start) + rebuilt + output.slice(end);
                changed = true;
                replaced = true;
                break;
            }
            if (!replaced) break;
            guard += 1;
        }
        return { text: output, changed };
    }

    function translateCategoriesAndFiles(text) {
        // Categorias
        text = text.replace(/\[\[\s*Category\s*:/gi, '[[Categoria:');
        // Dead link
        text = text.replace(/\{\{\s*Dead link\s*\}\}/gi, '{{Ligação inativa}}');
        // See also / Main
        text = text.replace(/\{\{\s*See also\s*\}\}/gi, '{{VT}}');
        text = text.replace(/\{\{\s*Main\s*\}\}/gi, '{{Artigo principal}}');
        // Arquivos
        text = text.replace(/\[\[\s*File\s*:/gi, '[[Ficheiro:');
        // Ajusta atributos de imagem apenas dentro de links de arquivo
        const imgOptMap = {
            right: 'direita',
            left: 'esquerda',
            center: 'centro',
            centre: 'centro',
            none: 'nenhum',
            border: 'borda',
            frame: 'moldura',
            frameless: 'sem moldura',
            thumb: 'thumb'
        };
        text = text.replace(/\[\[\s*(?:Ficheiro|File|Image)\s*:[^\]]*\]\]/gi, (match) => {
            return match.replace(/\|(right|left|center|centre|none|border|frame|frameless|thumb)\b/gi, (_, opt) => {
                const key = opt.toLowerCase();
                return '|' + (imgOptMap[key] || opt);
            });
        });
        return text;
    }

    function normalizeFormatnum(text) {
        const replaceFn = (_, num, unit) => {
            const trimmedNum = (num || '').trim();
            const trimmedUnit = unit ? unit.trim() : '';
            return trimmedUnit ? `{{fmtn|${trimmedNum}|${trimmedUnit}}}` : `{{fmtn|${trimmedNum}}}`;
        };
        text = text.replace(/\{\{\s*formatnum\s*:\s*([^{}|]+?)(?:\s*\|\s*([^{}]+?))?\s*}}/gi, replaceFn);
        text = text.replace(/\{\{\s*formatnum\s*\|\s*([^{}|]+?)(?:\s*\|\s*([^{}]+?))?\s*}}/gi, replaceFn);
        return text;
    }

    function fixCommonPtTypos(text) {
        const replacements = {
            'excessão': 'exceção',
            'excessões': 'exceções',
            'impecilho': 'empecilho',
            'beneficiente': 'beneficente',
            'beneficiencia': 'beneficência',
            'interperie': 'intempérie',
            'seje': 'seja',
            'menas': 'menos',
            'trousse': 'trouxe'
        };
        return text.replace(/\b[^\s|{}[\]]+\b/gi, (m) => {
            const lower = m.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(replacements, lower)) {
                const rep = replacements[lower];
                // preserva capitalização inicial
                if (m[0] === m[0].toUpperCase()) {
                    return rep.charAt(0).toUpperCase() + rep.slice(1);
                }
                return rep;
            }
            return m;
        });
    }

    function convertNumberEnToPt(numStr) {
        // remove separadores de milhar com vírgula e aplica agrupamento com espaço + vírgula decimal
        const cleaned = numStr.replace(/,/g, '');
        const parts = cleaned.split('.');
        const decimal = parts.length > 1 ? parts.pop() : null;
        const integer = parts.join('');
        const spaced = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return decimal ? spaced + ',' + decimal : spaced;
    }

    function translateTemplates(text) {
        const summaryNotes = new Set();
        // Aplica mapeamentos específicos por predefinição (inclui aninhadas)
        let changed = true;
        let safeGuard = 0;
        let templateFixes = 0;
        while (changed && safeGuard < 8) {
            const result = applyTemplateConfigs(text);
            text = result.text;
            changed = result.changed;
            templateFixes += result.count || 0;
            safeGuard += 1;
            if (result.changed) summaryNotes.add('templates');
        }

        const catFileResult = translateCategoriesAndFiles(text);
        if (catFileResult !== text) summaryNotes.add('categorias/imagens');
        text = catFileResult;

        const fmtNumResult = normalizeFormatnum(text);
        if (fmtNumResult !== text) summaryNotes.add('fmtn');
        text = fmtNumResult;

        const typoFixed = fixCommonPtTypos(text);
        if (typoFixed !== text) summaryNotes.add('ortografia');
        text = typoFixed;

        const alignedInfo = alignInfoTemplates(text);
        if (alignedInfo.changed) summaryNotes.add('alinhamento Info');
        text = alignedInfo.text;

        // Normaliza bloco de referências simples para a predefinição padrão
        const refNorm = text.replace(/\n==\s*Refer[eê]ncias\s*==\s*\n\s*\{\{\s*reflist\s*\}\}\s*/i, '\n{{Referências}}\n');
        if (refNorm !== text) summaryNotes.add('referências');
        text = refNorm;

        const summaryParts = [];
        if (templateFixes > 0) summaryParts.push(`templates:${templateFixes}`);
        Array.from(summaryNotes).forEach((s) => {
            if (s === 'templates') return;
            summaryParts.push(s);
        });
        const summary = summaryParts.length ? 'tradução EN→PT (' + summaryParts.join(', ') + ')' : 'tradução de templates EN→PT';
        return { text, summary };
    }

    function normalizeTitleForMatch(title) {
        return (title || '').replace(/_/g, ' ').trim().toLowerCase();
    }

    function extractLinks(text) {
        const re = /\[\[([^\]\|\n]+)(?:\|([^\]]*))?\]\]/g;
        const links = [];
        let m;
        while ((m = re.exec(text))) {
            const title = (m[1] || '').trim();
            if (!title) continue;
            // evita mexer em arquivos, categorias ou interwikis (com dois pontos)
            if (title.includes(':')) continue;
            links.push({ title, label: m[2], start: m.index, end: re.lastIndex });
        }
        return links;
    }

    async function fetchPageHtmlContent(title) {
        const url = mw.util.getUrl(title, { action: 'render' });
        const resp = await fetch(url, { headers: { Accept: 'text/html' } });
        if (!resp.ok) throw new Error('Falha ao obter HTML da página');
        return resp.text();
    }

    function redLinkTextsFromHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const missing = new Set();
        doc.querySelectorAll('a.new').forEach((a) => {
            const txt = (a.textContent || '').trim();
            const titleAttr = (a.getAttribute('title') || '').trim();
            const normText = normalizeTitleForMatch(txt);
            const normTitle = normalizeTitleForMatch(titleAttr);
            if (normText) missing.add(normText);
            if (normTitle) missing.add(normTitle);
        });
        return missing;
    }

    async function collectRedLinkTexts() {
        try {
            const pageTitle = mw.config.get('wgPageName');
            const html = await fetchPageHtmlContent(pageTitle);
            return redLinkTextsFromHtml(html);
        } catch (e) {
            mw.notify('Não foi possível obter links vermelhos da página.', { type: 'error' });
            return new Set();
        }
    }

    async function removeRedLinks(text) {
        const links = extractLinks(text);
        if (!links.length) return { text, removed: 0 };

        // Usa somente o HTML renderizado para identificar links vermelhos
        const missingSet = await collectRedLinkTexts();
        if (!missingSet.size) return { text, removed: 0 };

        const re = /\[\[([^\]\|\n]+)(?:\|([^\]]*))?\]\]/g;
        let removed = 0;
        const rebuilt = text.replace(re, (full, t, label) => {
            const normTitle = normalizeTitleForMatch(t);
            const normLabel = normalizeTitleForMatch(label || '');
            if (!missingSet.has(normTitle) && !missingSet.has(normLabel)) return full;
            removed += 1;
            return label !== undefined ? label : t;
        });

        return { text: rebuilt, removed };
    }

    function addButtons() {
        if (buttonsAdded || !textarea) return;
        buttonsAdded = true;
        const diffBtn = document.getElementById('wpDiff');
        const btnTranslate = document.createElement('input');
        btnTranslate.type = 'button';
        btnTranslate.className = diffBtn ? diffBtn.className : '';
        btnTranslate.id = 'traduzir-en-pt';
        btnTranslate.value = 'Traduzir EN→PT';
        btnTranslate.style.marginLeft = '6px';
        btnTranslate.addEventListener('click', function () {
            const result = translateTemplates(textarea.value);
            textarea.value = result.text;
            const summary = document.getElementById('wpSummary');
            if (summary) {
                const note = result.summary || 'tradução de templates EN→PT';
                if (summary.value && !summary.value.includes(note)) summary.value += ', ' + note;
                else if (!summary.value) summary.value = note;
            }
            if (diffBtn) diffBtn.click();
        });

        const btnRedLinks = document.createElement('input');
        btnRedLinks.type = 'button';
        btnRedLinks.className = diffBtn ? diffBtn.className : '';
        btnRedLinks.id = 'remover-links-vermelhos';
        btnRedLinks.value = 'Remover artigos vermelhos';
        btnRedLinks.style.marginLeft = '6px';
        btnRedLinks.addEventListener('click', async function () {
            btnRedLinks.disabled = true;
            const originalLabel = btnRedLinks.value;
            btnRedLinks.value = 'Verificando links...';
            try {
                const result = await removeRedLinks(textarea.value);
                if (result.removed > 0) {
                    textarea.value = result.text;
                    const summary = document.getElementById('wpSummary');
                    if (summary) {
                        const note = `remover links vermelhos (${result.removed})`;
                        if (summary.value && !summary.value.includes(note)) summary.value += ', ' + note;
                        else if (!summary.value) summary.value = note;
                    }
                    mw.notify(`Removidos ${result.removed} links vermelhos.`, { type: 'success' });
                } else {
                    mw.notify('Nenhum link vermelho encontrado no texto.', { type: 'info' });
                }
            } finally {
                btnRedLinks.disabled = false;
                btnRedLinks.value = originalLabel;
            }
        });

        if (diffBtn && diffBtn.parentNode) {
            diffBtn.parentNode.insertBefore(btnTranslate, diffBtn.nextSibling);
            diffBtn.parentNode.insertBefore(btnRedLinks, btnTranslate.nextSibling);
        } else {
            textarea.parentNode.insertBefore(btnTranslate, textarea.nextSibling);
            textarea.parentNode.insertBefore(btnRedLinks, btnTranslate.nextSibling);
        }
    }

    if (textarea) {
        addButtons();
    } else {
        const retry = setInterval(() => {
            const found = document.getElementById('wpTextbox1');
            if (found) {
                textarea = found;
                clearInterval(retry);
                addButtons();
            }
        }, 400);
    }
})();
