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
    const ns = mw.config.get('wgNamespaceNumber');
    const isCategoryView = ns === 14 && action === 'view';
    const isUserListView = ns === 2 && action === 'view';
    if (!isCategoryView && !isUserListView && action !== 'edit' && action !== 'submit') return;

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

    function removeEmptyParams(parts) {
        return parts.filter((p) => {
            const trimmed = (p || '').trim();
            if (!trimmed) return false;
            const m = trimmed.match(/^([^\s=]+)\s*=\s*([\s\S]*)$/);
            if (!m) return true;
            return m[2].trim() !== '';
        });
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
        const targetEqPos = maxNameLen + 1;
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
            if (cfg.target) {
                map.set(normalizeTplName(cfg.target), cfg);
            }
        });
        return map;
    }

    function protectedRanges(text) {
        const ranges = [];
        const addRanges = (regex) => {
            let m;
            while ((m = regex.exec(text))) {
                ranges.push({ start: m.index, end: regex.lastIndex });
            }
        };
        addRanges(/<nowiki[\s\S]*?<\/nowiki>/gi);
        addRanges(/<pre[\s\S]*?<\/pre>/gi);
        addRanges(/<code[\s\S]*?<\/code>/gi);
        addRanges(/<syntaxhighlight[\s\S]*?<\/syntaxhighlight>/gi);
        return ranges.sort((a, b) => a.start - b.start);
    }

    function findTemplates(text) {
        const matches = [];
        const len = text.length;
        const stack = [];
        const blocked = protectedRanges(text);
        let blockIdx = 0;
        for (let i = 0; i < len - 1; i++) {
            if (blockIdx < blocked.length && i >= blocked[blockIdx].start) {
                i = blocked[blockIdx].end - 1;
                blockIdx += 1;
                continue;
            }
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
            const fullPart = '|' + part;
            const m = part.match(/^\s*([^\s=]+)\s*=\s*([\s\S]*)$/);
            if (!m) {
                const value = part;
                const cleanValue = value.trim();
                if (cleanValue === '') {
                    return;
                }
                const posCfg = positionalCfg[positionalIndex] || null;
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
            const isDateField = dateSet.has(mappedName) || (isObjectCfg && paramCfg.mask);
            const isLikelyUrl = /:\/\/\S+/.test(cleanValue) || /^www\./i.test(cleanValue);
            const hasDigits = /\d/.test(cleanValue);
            const hasLetters = /[A-Za-z]/.test(cleanValue);
            const isRangeOrApprox = /[–—-]\s*\d{2,4}/.test(cleanValue) || /\b(c\.|ca\.|circa|aprox\.?|pre|pré)/i.test(cleanValue);
            let mappedValue = value;
            const maskFromCfg = paramMaskMap.get(mappedName) || (isObjectCfg && paramCfg.mask ? paramCfg.mask : null);
            const mask = maskFromCfg || (isDateField ? DEFAULT_DATE_MASK : null);
            if (isDateField && !isLikelyUrl && !isRangeOrApprox) {
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
                    continue;
                }
                output = output.slice(0, start) + translated + output.slice(end);
                changed = true;
                count += 1;
                replaced = true;
                break;
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
        let count = 0;
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
                const parts = removeEmptyParams(splitParamsSafe(content));
                if (parts.length <= 1) continue;
                const aligned = alignEquals(parts);
                const rebuilt = `{{${rawName}\n${aligned.join('\n')}\n}}`;
                if (rebuilt === raw) continue;
                output = output.slice(0, start) + rebuilt + output.slice(end);
                changed = true;
                count += 1;
                replaced = true;
                break;
            }
            if (!replaced) break;
            guard += 1;
        }
        return { text: output, changed, count };
    }

    function translateCategoriesAndFiles(text) {
        text = text.replace(/\[\[\s*Category\s*:/gi, '[[Categoria:');
        text = text.replace(/\{\{\s*Dead link\s*\}\}/gi, '{{Ligação inativa}}');
        text = text.replace(/\{\{\s*See also\s*\}\}/gi, '{{VT}}');
        text = text.replace(/\{\{\s*Main\s*\}\}/gi, '{{Artigo principal}}');
        text = text.replace(/\[\[\s*File\s*:/gi, '[[Ficheiro:');
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
            excessão: 'exceção',
            excessões: 'exceções',
            impecilho: 'empecilho',
            beneficiente: 'beneficente',
            beneficiencia: 'beneficência',
            interperie: 'intempérie',
            seje: 'seja',
            menas: 'menos',
            trousse: 'trouxe'
        };
        return text.replace(/\b[^\s|{}[\]]+\b/gi, (m) => {
            const lower = m.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(replacements, lower)) {
                const rep = replacements[lower];
                if (m[0] === m[0].toUpperCase()) {
                    return rep.charAt(0).toUpperCase() + rep.slice(1);
                }
                return rep;
            }
            return m;
        });
    }

    function convertNumberEnToPt(numStr) {
        const cleaned = numStr.replace(/,/g, '');
        const parts = cleaned.split('.');
        const decimal = parts.length > 1 ? parts.pop() : null;
        const integer = parts.join('');
        const spaced = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return decimal ? spaced + ',' + decimal : spaced;
    }

    function formatTodayIso() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    async function checkUrlAccessible(url) {
        try {
            const headResp = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            if (headResp && typeof headResp.ok === 'boolean') {
                if (headResp.ok) return { ok: true, status: headResp.status };
                if (headResp.status === 405 || headResp.status === 403) {
                    const getResp = await fetch(url, { method: 'GET', mode: 'no-cors' });
                    return { ok: getResp.ok, status: getResp.status };
                }
                return { ok: false, status: headResp.status };
            }
            return { ok: false, status: 0 };
        } catch (e) {
            return { ok: false, status: 0, error: e && e.message ? e.message : 'erro' };
        }
    }

    async function fetchCitationData(url) {
        if (!fetchCitationData.cache) fetchCitationData.cache = new Map();
        if (fetchCitationData.cache.has(url)) return fetchCitationData.cache.get(url);
        const encoded = encodeURIComponent(url);
        const endpoint = `https://pt.wikipedia.org/api/rest_v1/data/citation/mediawiki/${encoded}`;
        try {
            const resp = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            const status = resp.status || 0;
            if (!resp.ok) {
                const result = { data: null, status };
                fetchCitationData.cache.set(url, result);
                return result;
            }
            const data = await resp.json();
            const picked = Array.isArray(data) && data.length ? data[0] : null;
            const result = { data: picked, status };
            fetchCitationData.cache.set(url, result);
            return result;
        } catch (e) {
            const result = { data: null, status: 0, error: e && e.message ? e.message : 'erro' };
            fetchCitationData.cache.set(url, result);
            return result;
        }
    }

    function buildCitationFromData(data, opts = {}) {
        if (!data) return null;
        const accessOverride = opts.accessDateOverride || null;
        const isJournal = data.itemType === 'journalArticle' || data.publicationTitle;
        const tpl = isJournal ? 'citar periódico' : 'citar web';
        const parts = [];
        const add = (key, val) => {
            if (!val) return;
            parts.push(`|${key}=${val}`);
        };
        if (Array.isArray(data.author) && data.author.length) {
            const [first, last] = data.author[0];
            add('ultimo', last);
            add('primeiro', first);
        }
        add('titulo', data.title || data['title-short'] || '');
        if (isJournal) {
            add('periódico', data.publicationTitle || data.websiteTitle || data.publisher);
            add('volume', data.volume);
            add('número', data.issue);
            add('paginas', data.pages);
        } else {
            add('obra', data.publicationTitle || data.websiteTitle);
            add('publicado', data.publisher || data.institution);
        }
        add('data', data.date);
        add('acessodata', accessOverride || data.accessDate);
        add('doi', data.DOI);
        add('issn', Array.isArray(data.ISSN) ? data.ISSN[0] : data.ISSN);
        add('url', data.url);
        add('arquivourl', data.archiveUrl);
        add('arquivodata', data.archiveDate);
        return `{{${tpl}${parts.join('')}}}`;
    }

    function buildFallbackCitation(url, label, accessOverride) {
        if (!url) return null;
        let host = '';
        try {
            const u = new URL(url);
            host = (u.hostname || '').replace(/^www\./i, '');
        } catch (e) {
            host = '';
        }
        const parts = [];
        const add = (key, val) => {
            if (!val) return;
            parts.push(`|${key}=${val}`);
        };
        add('titulo', label || url);
        add('url', url);
        add('obra', host || null);
        if (accessOverride) add('acessodata', accessOverride);
        return parts.length ? `{{citar web${parts.join('')}}}` : null;
    }

    function shortHash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
        }
        return h.toString(36);
    }

    function slugFromUrl(url) {
        try {
            const u = new URL(url);
            const host = (u.hostname || '').replace(/^www\./i, '');
            const hostParts = host.split('.').filter(Boolean);
            const hostWord = hostParts.length ? hostParts[hostParts.length - 2] || hostParts[0] : '';
            const segments = (u.pathname || '').split('/').filter(Boolean);
            const tailRaw = segments.length ? segments[segments.length - 1] : '';
            const tail = (() => {
                try {
                    return decodeURIComponent(tailRaw);
                } catch (e) {
                    return tailRaw;
                }
            })();
            const words = (str) => (str || '').split(/[^a-z0-9]+/gi).filter(Boolean).map((w) => w.toLowerCase());
            const tailWords = words(tail);
            const hostWords = words(hostWord);
            const candidates = [...tailWords, ...hostWords];
            const pick = candidates.find((w) => w.length >= 4 && w.length <= 12) || candidates.find((w) => w.length >= 3) || candidates[0] || 'link';
            const base = pick.slice(0, 12);
            return /^\d+$/.test(base) ? 'link' : base;
        } catch (e) {
            const safe = String(url || '').replace(/[^a-z0-9]+/gi, '').toLowerCase();
            return (safe || 'link').slice(0, 12);
        }
    }

    function extractUrlFromTemplateBody(body) {
        const m = body.match(/\burl\s*=\s*([^|}]+)/i);
        return m ? m[1].trim() : null;
    }

    function updateAccessDateInTemplate(body, newDate) {
        if (!newDate) return body;
        const hasParam = /\bacesso?data\s*=\s*[^|}]+/i;
        if (hasParam.test(body)) {
            return body.replace(hasParam, `acessodata=${newDate}`);
        }
        const closeIdx = body.lastIndexOf('}}');
        if (closeIdx === -1) return body;
        return body.slice(0, closeIdx) + `|acessodata=${newDate}` + body.slice(closeIdx);
    }

    function gatherExistingRefNames(text) {
        const names = new Set();
        const re = /<ref[^>]*\bname\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s/>]+))/gi;
        let m;
        while ((m = re.exec(text))) {
            const name = m[1] || m[2] || m[3] || '';
            if (name) names.add(name);
        }
        return names;
    }

    function resolveCategoryDepth() {
        const input = prompt('Profundidade de subcategorias (0 = apenas esta categoria; máx 4)', '0');
        if (input === null) return null;
        const num = parseInt(input, 10);
        if (!Number.isFinite(num) || num < 0) return 0;
        return Math.min(num, 4);
    }

    async function fetchCategoryMembersAll(api, catTitle) {
        const pages = [];
        const subcats = [];
        let cont = null;
        do {
            const resp = await api.get({
                action: 'query',
                list: 'categorymembers',
                cmtitle: catTitle.replace(/_/g, ' '),
                cmnamespace: '0|14',
                cmtype: 'page|subcat',
                cmlimit: 'max',
                cmcontinue: cont || undefined,
                formatversion: 2
            });
            const members = (resp.query && resp.query.categorymembers) || [];
            members.forEach((m) => {
                if (m.ns === 0) pages.push(m.title);
                if (m.ns === 14) subcats.push(m.title);
            });
            cont = resp.continue && resp.continue.cmcontinue ? resp.continue.cmcontinue : null;
        } while (cont);
        return { pages, subcats };
    }

    async function translateTitlesBatch(titles, opts = {}) {
        const api = new mw.Api();
        const progress = createProgressUI(opts.progressTitle || 'Processando páginas...');
        try {
            const total = titles.length;
            let done = 0;
            let edited = 0;
            const failures = [];
            for (const title of titles) {
                if (progress.isCanceled && progress.isCanceled()) {
                    mw.notify('Processamento cancelado.', { type: 'warn' });
                    break;
                }
                progress.update(done, total, `Carregando ${title}`);
                try {
                    const pageResp = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        rvslots: 'main',
                        rvprop: 'content',
                        titles: title,
                        formatversion: 2
                    });
                    const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
                    const content = page && page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
                    const text = content || '';
                    const translated = translateTemplates(text);
                    if (translated.text !== text) {
                        await api.postWithToken('csrf', {
                            action: 'edit',
                            title,
                            text: translated.text,
                            summary: translated.summary || (opts.summary || 'ajustes automáticos (lote)'),
                            nocreate: 1,
                            minor: true
                        });
                        edited += 1;
                        progress.update(done, total, `Editado ${title}`);
                    } else {
                        progress.update(done, total, `Sem mudanças em ${title}`);
                    }
                } catch (e) {
                    failures.push(title);
                } finally {
                    done += 1;
                    progress.update(done, total, `Concluído ${done}/${total}`);
                }
            }
            mw.notify(`Processados ${titles.length} artigos; editados ${edited}.`, { type: 'success' });
            if (failures.length) {
                mw.notify(`Falhou em: ${failures.join(', ')}`, { type: 'warn' });
            }
        } finally {
            progress.close();
        }
    }

    async function formatTitlesRefsBatch(titles, opts = {}) {
        const api = new mw.Api();
        const progress = createProgressUI(opts.progressTitle || 'Formatando referências...');
        try {
            const total = titles.length;
            let done = 0;
            let edited = 0;
            const failures = [];
            for (const title of titles) {
                if (progress.isCanceled && progress.isCanceled()) {
                    mw.notify('Processamento cancelado.', { type: 'warn' });
                    break;
                }
                progress.update(done, total, `Carregando ${title}`);
                try {
                    const pageResp = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        rvslots: 'main',
                        rvprop: 'content',
                        titles: title,
                        formatversion: 2
                    });
                    const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
                    const content = page && page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
                    const text = content || '';
                    const result = await convertExternalRefs(text, (d, t, msg) => {
                        progress.update(done, total, msg || `Processando ${title}`);
                    }, () => progress.isCanceled && progress.isCanceled(), { collectApi404: false });
                    if (result.text && result.converted > 0 && result.text !== text) {
                        await api.postWithToken('csrf', {
                            action: 'edit',
                            title,
                            text: result.text,
                            summary: result.summary || (opts.summary || 'ajustes automáticos (refs externas)'),
                            nocreate: 1,
                            minor: true
                        });
                        edited += 1;
                        progress.update(done, total, `Editado ${title}`);
                    } else {
                        progress.update(done, total, `Sem mudanças em ${title}`);
                    }
                } catch (e) {
                    failures.push(title);
                } finally {
                    done += 1;
                    progress.update(done, total, `Concluído ${done}/${total}`);
                }
            }
            mw.notify(`Processados ${titles.length} artigos; editados ${edited}.`, { type: 'success' });
            if (failures.length) {
                mw.notify(`Falhou em: ${failures.join(', ')}`, { type: 'warn' });
            }
        } finally {
            progress.close();
        }
    }

    async function gatherCategoryArticles(api, catTitle, depth, isCanceled, progressCb) {
        const queue = [{ title: catTitle, level: 0 }];
        const seenCats = new Set();
        const articles = new Set();
        let processed = 0;
        while (queue.length) {
            if (isCanceled && isCanceled()) break;
            const current = queue.shift();
            if (seenCats.has(current.title)) continue;
            seenCats.add(current.title);
            if (progressCb) progressCb(processed, processed + queue.length + 1, `Lendo ${current.title}`);
            const { pages, subcats } = await fetchCategoryMembersAll(api, current.title);
            pages.forEach((p) => articles.add(p));
            if (current.level < depth) {
                subcats.forEach((sc) => queue.push({ title: sc, level: current.level + 1 }));
            }
            processed += 1;
        }
        return { titles: Array.from(articles), canceled: isCanceled && isCanceled() };
    }

    async function translateCategoryMembers(depth = 0) {
        const ns = mw.config.get('wgNamespaceNumber');
        if (ns !== 14) return;
        const catTitle = mw.config.get('wgPageName');
        const api = new mw.Api();
        const progress = createProgressUI('Traduzindo categoria...');
        try {
            const { titles, canceled } = await gatherCategoryArticles(
                api,
                catTitle,
                depth,
                () => progress.isCanceled && progress.isCanceled(),
                (done, total, msg) => progress.update(done, total, msg)
            );
            if (canceled) {
                mw.notify('Processamento cancelado.', { type: 'warn' });
                return;
            }
            if (!titles.length) {
                mw.notify('Categoria sem artigos para processar.', { type: 'info' });
                return;
            }
            await translateTitlesBatch(titles, { progressTitle: 'Traduzindo categoria...', summary: 'ajustes automáticos (categoria)' });
        } finally {
            progress.close();
        }
    }

    async function formatCategoryRefs(depth = 0) {
        const ns = mw.config.get('wgNamespaceNumber');
        if (ns !== 14) return;
        const catTitle = mw.config.get('wgPageName');
        const api = new mw.Api();
        const collectProgress = createProgressUI('Coletando artigos da categoria...');
        let titles = [];
        let canceled = false;
        try {
            const gathered = await gatherCategoryArticles(
                api,
                catTitle,
                depth,
                () => collectProgress.isCanceled && collectProgress.isCanceled(),
                (done, total, msg) => collectProgress.update(done, total, msg || 'Lendo categoria...')
            );
            titles = gathered.titles;
            canceled = gathered.canceled;
            if (canceled) {
                mw.notify('Processamento cancelado.', { type: 'warn' });
                return;
            }
            if (!titles.length) {
                mw.notify('Categoria sem artigos para processar.', { type: 'info' });
                return;
            }
        } finally {
            collectProgress.close();
        }
        await formatTitlesRefsBatch(titles, { progressTitle: 'Formatando refs da categoria...', summary: 'ajustes automáticos (refs externas categoria)' });
    }

    function extractMainspaceLinks(text) {
        const re = /\[\[([^\]\|\n]+)(?:\|[^\]]*)?\]\]/g;
        const titles = new Set();
        let m;
        while ((m = re.exec(text))) {
            const title = (m[1] || '').trim();
            if (!title) continue;
            if (title.includes(':')) continue;
            titles.add(title);
        }
        return Array.from(titles);
    }

    async function translateListPageArticles(listTitle) {
        const api = new mw.Api();
        const progress = createProgressUI('Lendo lista...');
        let closed = false;
        try {
            const pageResp = await api.get({
                action: 'query',
                prop: 'revisions',
                rvslots: 'main',
                rvprop: 'content',
                titles: listTitle,
                formatversion: 2
            });
            const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
            if (!page || page.missing) {
                mw.notify('Página da lista não encontrada.', { type: 'error' });
                return;
            }
            const content = page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
            const text = content || '';
            const titles = extractMainspaceLinks(text);
            if (!titles.length) {
                mw.notify('Nenhum artigo principal listado nesta página.', { type: 'info' });
                return;
            }
            progress.close();
            closed = true;
            await translateTitlesBatch(titles, { progressTitle: 'Traduzindo lista...', summary: 'ajustes automáticos (lista)' });
        } finally {
            if (!closed && progress.close) progress.close();
        }
    }

    async function formatTitlesRefsBatch(titles, opts = {}) {
        const api = new mw.Api();
        const progress = createProgressUI(opts.progressTitle || 'Formatando referências...');
        try {
            const total = titles.length;
            let done = 0;
            let edited = 0;
            const failures = [];
            for (const title of titles) {
                if (progress.isCanceled && progress.isCanceled()) {
                    mw.notify('Processamento cancelado.', { type: 'warn' });
                    break;
                }
                progress.update(done, total, `Carregando ${title}`);
                try {
                    const pageResp = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        rvslots: 'main',
                        rvprop: 'content',
                        titles: title,
                        formatversion: 2
                    });
                    const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
                    const content = page && page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
                    const text = content || '';
                    const result = await convertExternalRefs(text, null, () => progress.isCanceled && progress.isCanceled(), { collectApi404: false });
                    if (result.converted > 0) {
                        await api.postWithToken('csrf', {
                            action: 'edit',
                            title,
                            text: result.text,
                            summary: opts.summary || 'ajustes automáticos (refs externas)',
                            nocreate: 1,
                            minor: true
                        });
                        edited += 1;
                        progress.update(done, total, `Editado ${title}`);
                    } else {
                        progress.update(done, total, `Sem mudanças em ${title}`);
                    }
                } catch (e) {
                    failures.push(title);
                } finally {
                    done += 1;
                    progress.update(done, total, `Concluído ${done}/${total}`);
                }
            }
            mw.notify(`Processados ${titles.length} artigos; editados ${edited}.`, { type: 'success' });
            if (failures.length) {
                mw.notify(`Falhou em: ${failures.join(', ')}`, { type: 'warn' });
            }
        } finally {
            progress.close();
        }
    }

    async function formatTitlesRefsBatch(titles, opts = {}) {
        const api = new mw.Api();
        const progress = createProgressUI(opts.progressTitle || 'Formatando referências...');
        try {
            const total = titles.length;
            let done = 0;
            let edited = 0;
            const failures = [];
            for (const title of titles) {
                if (progress.isCanceled && progress.isCanceled()) {
                    mw.notify('Processamento cancelado.', { type: 'warn' });
                    break;
                }
                progress.update(done, total, `Carregando ${title}`);
                try {
                    const pageResp = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        rvslots: 'main',
                        rvprop: 'content',
                        titles: title,
                        formatversion: 2
                    });
                    const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
                    const content = page && page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
                    const text = content || '';
                    const formatted = await convertExternalRefs(text, null, () => progress.isCanceled && progress.isCanceled(), { collectApi404: false });
                    if (formatted.converted > 0 && formatted.text !== text) {
                        await api.postWithToken('csrf', {
                            action: 'edit',
                            title,
                            text: formatted.text,
                            summary: formatted.summary || (opts.summary || 'ajustes automáticos (refs externas)'),
                            nocreate: 1,
                            minor: true
                        });
                        edited += 1;
                        progress.update(done, total, `Editado ${title}`);
                    } else {
                        progress.update(done, total, `Sem mudanças em ${title}`);
                    }
                } catch (e) {
                    failures.push(title);
                } finally {
                    done += 1;
                    progress.update(done, total, `Concluído ${done}/${total}`);
                }
            }
            mw.notify(`Processados ${titles.length} artigos; editados ${edited}.`, { type: 'success' });
            if (failures.length) {
                mw.notify(`Falhou em: ${failures.join(', ')}`, { type: 'warn' });
            }
        } finally {
            progress.close();
        }
    }

    async function formatRefsBatch(titles, opts = {}) {
        const api = new mw.Api();
        const progress = createProgressUI(opts.progressTitle || 'Formatando referências...');
        try {
            const total = titles.length;
            let done = 0;
            let edited = 0;
            const failures = [];
            for (const title of titles) {
                if (progress.isCanceled && progress.isCanceled()) {
                    mw.notify('Processamento cancelado.', { type: 'warn' });
                    break;
                }
                progress.update(done, total, `Carregando ${title}`);
                try {
                    const pageResp = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        rvslots: 'main',
                        rvprop: 'content',
                        titles: title,
                        formatversion: 2
                    });
                    const page = pageResp.query && pageResp.query.pages && pageResp.query.pages[0];
                    const content = page && page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main && (page.revisions[0].slots.main.content || page.revisions[0].slots.main['*']);
                    const text = content || '';
                    const result = await convertExternalRefs(text, null, () => progress.isCanceled && progress.isCanceled(), { collectApi404: false });
                    if (result.converted > 0) {
                        await api.postWithToken('csrf', {
                            action: 'edit',
                            title,
                            text: result.text,
                            summary: opts.summary || 'refs externas (categoria)',
                            nocreate: 1,
                            minor: true
                        });
                        edited += 1;
                        progress.update(done, total, `Referências formatadas em ${title}`);
                    } else {
                        progress.update(done, total, `Sem mudanças em ${title}`);
                    }
                } catch (e) {
                    failures.push(title);
                } finally {
                    done += 1;
                    progress.update(done, total, `Concluído ${done}/${total}`);
                }
            }
            mw.notify(`Processados ${titles.length} artigos; refs formatadas em ${edited}.`, { type: 'success' });
            if (failures.length) {
                mw.notify(`Falhou em: ${failures.join(', ')}`, { type: 'warn' });
            }
        } finally {
            progress.close();
        }
    }

    async function formatCategoryRefs(depth = 0) {
        const ns = mw.config.get('wgNamespaceNumber');
        if (ns !== 14) return;
        const catTitle = mw.config.get('wgPageName');
        const api = new mw.Api();
        const titles = await gatherCategoryArticles(api, catTitle, depth);
        if (!titles.length) {
            mw.notify('Categoria sem artigos para processar.', { type: 'info' });
            return;
        }
        await formatRefsBatch(titles, { progressTitle: 'Formatando refs da categoria...', summary: 'refs externas (categoria)' });
    }

    function addCategoryViewTab() {
        const list = document.querySelector('#p-views .vector-menu-content-list');
        if (!list) return false;
        if (document.getElementById('ca-translate-category')) return true;
        const li = document.createElement('li');
        li.id = 'ca-translate-category';
        li.className = 'mw-list-item';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Traduzir EN→PT';
        a.title = 'Traduzir todos os artigos desta categoria';
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            const depth = resolveCategoryDepth();
            if (depth === null) return;
            li.classList.add('selected');
            try {
                await translateCategoryMembers(depth);
            } finally {
                li.classList.remove('selected');
            }
        });
        li.appendChild(a);
        list.appendChild(li);
        return true;
    }

    function addCategoryRefsTab() {
        const list = document.querySelector('#p-views .vector-menu-content-list');
        if (!list) return false;
        if (document.getElementById('ca-format-refs-category')) return true;
        const li = document.createElement('li');
        li.id = 'ca-format-refs-category';
        li.className = 'mw-list-item';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Formatar refs';
        a.title = 'Formatar referências em todos os artigos desta categoria';
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            const depth = resolveCategoryDepth();
            if (depth === null) return;
            li.classList.add('selected');
            try {
                await formatCategoryRefs(depth);
            } finally {
                li.classList.remove('selected');
            }
        });
        li.appendChild(a);
        list.appendChild(li);
        return true;
    }

    function addCategoryRefsTab() {
        const list = document.querySelector('#p-views .vector-menu-content-list');
        if (!list) return false;
        if (document.getElementById('ca-format-refs-category')) return true;
        const li = document.createElement('li');
        li.id = 'ca-format-refs-category';
        li.className = 'mw-list-item';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Formatar referências';
        a.title = 'Formatar referências em todos os artigos desta categoria';
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            const depth = resolveCategoryDepth();
            if (depth === null) return;
            li.classList.add('selected');
            try {
                await formatCategoryRefs(depth);
            } finally {
                li.classList.remove('selected');
            }
        });
        li.appendChild(a);
        list.appendChild(li);
        return true;
    }

    function addCategoryRefsTab() {
        const list = document.querySelector('#p-views .vector-menu-content-list');
        if (!list) return false;
        if (document.getElementById('ca-format-refs-category')) return true;
        const li = document.createElement('li');
        li.id = 'ca-format-refs-category';
        li.className = 'mw-list-item';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Formatar referências';
        a.title = 'Formatar referências de todos os artigos desta categoria';
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            const depth = resolveCategoryDepth();
            if (depth === null) return;
            li.classList.add('selected');
            try {
                await formatCategoryRefs(depth);
            } finally {
                li.classList.remove('selected');
            }
        });
        li.appendChild(a);
        list.appendChild(li);
        return true;
    }

    function addUserListViewTab() {
        const list = document.querySelector('#p-views .vector-menu-content-list');
        if (!list) return false;
        if (document.getElementById('ca-translate-list')) return true;
        const li = document.createElement('li');
        li.id = 'ca-translate-list';
        li.className = 'mw-list-item';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Traduzir lista';
        a.title = 'Traduzir todos os artigos listados nesta página de usuário';
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            const defaultTitle = mw.config.get('wgPageName');
            const input = prompt('Página de usuário com a lista de artigos:', defaultTitle);
            if (input === null || !input.trim()) return;
            li.classList.add('selected');
            try {
                await translateListPageArticles(input.trim());
            } finally {
                li.classList.remove('selected');
            }
        });
        li.appendChild(a);
        list.appendChild(li);
        return true;
    }

    function createProgressUI(titleText = 'Formatando referências...') {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 320px;
            background: #fff;
            border: 1px solid #a2a9b1;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 12px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #202122;
        `;

        const title = document.createElement('div');
        title.textContent = titleText;
        title.style.cssText = 'font-weight: 600; margin-bottom: 8px; font-size: 13px;';
        overlay.appendChild(title);

        const barWrapper = document.createElement('div');
        barWrapper.style.cssText = 'width: 100%; height: 10px; background: #f1f2f3; border-radius: 5px; overflow: hidden; margin-bottom: 8px;';
        const barFill = document.createElement('div');
        barFill.style.cssText = 'height: 100%; width: 0%; background: linear-gradient(90deg, #36c, #2a4b8d); transition: width 0.2s ease;';
        barWrapper.appendChild(barFill);
        overlay.appendChild(barWrapper);

        const status = document.createElement('div');
        status.style.cssText = 'font-size: 12px; margin-bottom: 8px;';
        status.textContent = 'Preparando...';
        overlay.appendChild(status);

        const logBox = document.createElement('div');
        logBox.style.cssText = 'max-height: 140px; overflow-y: auto; border: 1px solid #eaecf0; border-radius: 4px; padding: 6px; background: #f8f9fa; font-size: 12px;';
        overlay.appendChild(logBox);

        const actions = document.createElement('div');
        actions.style.cssText = 'display: flex; justify-content: flex-end; margin-top: 8px;';
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = 'padding: 4px 8px; font-size: 12px; border: 1px solid #a2a9b1; border-radius: 3px; background: #f8f9fa; cursor: pointer;';
        actions.appendChild(cancelBtn);
        overlay.appendChild(actions);

        document.body.appendChild(overlay);

        const appendLog = (msg) => {
            if (!msg) return;
            const entry = document.createElement('div');
            entry.textContent = msg;
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        };

        const cancelState = { canceled: false };
        cancelBtn.addEventListener('click', () => {
            cancelState.canceled = true;
            appendLog('Cancelado pelo usuário.');
        });

        return {
            update(done, total, message) {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                barFill.style.width = Math.min(100, pct) + '%';
                status.textContent = `${done}/${total} (${pct}%)`;
                appendLog(message);
            },
            isCanceled() {
                return cancelState.canceled;
            },
            close() {
                overlay.remove();
            }
        };
    }

    function showApi404Checklist(urls, onApply) {
        if (!urls || !urls.length) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            width: 360px;
            background: #fff;
            border: 1px solid #a2a9b1;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            padding: 12px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #202122;
        `;

        const title = document.createElement('div');
        title.textContent = 'URLs sem dados (404 na API)';
        title.style.cssText = 'font-weight: 600; margin-bottom: 8px; font-size: 13px;';
        overlay.appendChild(title);

        const list = document.createElement('div');
        list.style.cssText = 'max-height: 340px; overflow-y: auto; border: 1px solid #eaecf0; border-radius: 4px; padding: 6px; background: #f8f9fa; font-size: 12px; display: flex; flex-direction: column; gap: 6px;';
        urls.forEach((u, idx) => {
            const row = document.createElement('label');
            const isEven = idx % 2 === 0;
            row.style.cssText = `display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 4px; background: ${isEven ? '#fff' : '#eef2f7'};`;
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.value = u;
            const idxSpan = document.createElement('span');
            idxSpan.textContent = `${idx + 1}.`;
            idxSpan.style.cssText = 'min-width: 20px; color: #54595d;';
            const link = document.createElement('a');
            link.href = u;
            link.textContent = u;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.cssText = 'word-break: break-word;';
            row.appendChild(idxSpan);
            row.appendChild(cb);
            row.appendChild(link);
            list.appendChild(row);
        });
        overlay.appendChild(list);

        const actions = document.createElement('div');
        actions.style.cssText = 'display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fechar';
        closeBtn.style.cssText = 'padding: 4px 8px; font-size: 12px; border: 1px solid #a2a9b1; border-radius: 3px; background: #f8f9fa; cursor: pointer;';
        closeBtn.addEventListener('click', () => overlay.remove());

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Marcar como ligação inativa';
        applyBtn.style.cssText = 'padding: 4px 8px; font-size: 12px; border: 1px solid #36c; border-radius: 3px; background: #36c; color: white; cursor: pointer;';
        applyBtn.addEventListener('click', () => {
            const checked = Array.from(list.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
            if (onApply) onApply(checked);
            overlay.remove();
        });

        actions.appendChild(closeBtn);
        actions.appendChild(applyBtn);
        overlay.appendChild(actions);

        document.body.appendChild(overlay);
    }

    function annotateDeadLinks(text, urls) {
        if (!urls || !urls.length) return text;
        let output = text;
        urls.forEach((url) => {
            if (!url) return;
            const pattern = new RegExp(`(<ref[^>]*>[\\s\\S]*?${escapeRegExp(url)}[\\s\\S]*?<\\/ref>)(?!\\s*\\{\\{Ligação\\s+inativa)`, 'gi');
            output = output.replace(pattern, (full) => {
                if (/\{\{\s*Ligação\s+inativa\b/i.test(full)) return full;
                return `${full} {{Ligação inativa|data=December de 2025}}`;
            });
        });
        return output;
    }

    async function convertExternalRefs(text, progressCb, isCanceled, opts = {}) {
        const refRe = /<ref([^>]*)>([\s\S]*?)<\/ref>/gi;
        const items = [];
        let match;
        while ((match = refRe.exec(text))) {
            const full = match[0];
            const attrs = match[1] || '';
            const body = match[2] || '';
            const hasTemplate = /\{\{/.test(body);

            const linkMatch = hasTemplate ? null : body.match(/\[\s*(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\s*\]/i);
            const plainMatch = hasTemplate ? null : body.match(/\bhttps?:\/\/[^\s<>\]]+/i);
            const templateUrl = hasTemplate ? extractUrlFromTemplateBody(body) : null;
            const url = linkMatch ? linkMatch[1] : (plainMatch ? plainMatch[0] : templateUrl);
            const linkLabel = linkMatch ? (linkMatch[2] || '').trim() : '';
            if (!url) continue;
            if (/\b(pastebin|rawgithub|rawgit|example\.com)\b/i.test(url)) continue;

            items.push({
                start: match.index,
                end: match.index + full.length,
                attrs,
                body,
                hasTemplate,
                url,
                linkLabel
            });
        }

        if (!items.length) return { text, converted: 0, api404: [] };

        const total = items.length;
        let done = 0;
        const results = [];
        const api404 = new Set();
        const collect404 = opts.collectApi404 !== false;
        const doReplacements = opts.doReplacements !== false;
        const report = (d, msg) => {
            const safeDone = Math.min(d, total);
            if (progressCb) progressCb(safeDone, total, msg);
        };
        report(done, 'Preparando referências...');

        const concurrency = 6;
        let nextIdx = 0;

        const shouldCancel = () => (isCanceled && isCanceled());

        const processItem = async (item) => {
            if (shouldCancel()) return;
            try {
                report(done, `Processando URL: ${item.url}`);
                const citation = await fetchCitationData(item.url);
                const data = citation ? citation.data : null;
                const status = citation ? citation.status : 0;
                const is404 = status === 404;
                if (is404 && collect404) api404.add(item.url);
                if (item.hasTemplate) {
                    const newDate = data ? formatTodayIso() : null;
                    const updatedBody = updateAccessDateInTemplate(item.body, newDate);
                    if (doReplacements && (data || updatedBody !== item.body)) {
                        if (!data) report(done, is404 ? `API 404 para ${item.url}` : `Sem dados para ${item.url}`);
                        results.push({
                            start: item.start,
                            end: item.end,
                            replace: `<ref${item.attrs}>${updatedBody}</ref>`,
                            attrs: item.attrs,
                            url: item.url
                        });
                    }
                } else {
                    const newDate = data ? formatTodayIso() : null;
                    const tplFromData = buildCitationFromData(data, {
                        accessDateOverride: newDate
                    });
                    const fallbackTpl = tplFromData || buildFallbackCitation(item.url, item.linkLabel, null);
                    if (doReplacements && fallbackTpl) {
                        if (!data) report(done, is404 ? `API 404 para ${item.url}` : `Sem dados para ${item.url}`);
                        results.push({
                            start: item.start,
                            end: item.end,
                            replace: `<ref${item.attrs}>${fallbackTpl}</ref>`,
                            attrs: item.attrs,
                            url: item.url
                        });
                    } else {
                        report(done, `Sem citação para ${item.url}`);
                    }
                }
            } catch (e) {
                // ignore failed item
            } finally {
                done += 1;
                report(done, `Concluído ${done}/${total}`);
            }
        };

        const worker = async () => {
            while (true) {
                if (shouldCancel()) {
                    report(done, 'Processo cancelado.');
                    nextIdx = items.length;
                    return;
                }
                const current = nextIdx;
                if (current >= items.length) return;
                nextIdx += 1;
                await processItem(items[current]);
            }
        };

        const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
        await Promise.all(workers);

        if (!doReplacements) {
            return { text, converted: 0, api404: Array.from(api404) };
        }

        const dedupeRefs = () => {
            const byUrl = new Map();
            const usedNames = gatherExistingRefNames(text);
            let counter = 2;
            const sorted = [...results].sort((a, b) => a.start - b.start);
            sorted.forEach((r) => {
                if (!r.url) return;
                if (r.attrs && /\bname\s*=/.test(r.attrs)) return;
                if (r.attrs && r.attrs.trim()) return;
                let name = byUrl.get(r.url);
                if (!name) {
                    const base = slugFromUrl(r.url);
                    const safeBase = (!base || /^\d+$/.test(base)) ? 'link' : base;
                    name = safeBase;
                    while (usedNames.has(name)) {
                        if (counter > 99) {
                            name = `${safeBase}${shortHash(r.url).slice(0, 2)}`;
                            break;
                        }
                        name = `${safeBase}${counter++}`;
                    }
                    usedNames.add(name);
                    byUrl.set(r.url, name);
                    r.replace = r.replace.replace(/^<ref\b/, `<ref name="${name}"`);
                } else {
                    r.replace = `<ref name="${name}" />`;
                }
            });
        };
        if (results.length) dedupeRefs();

        if (!results.length) return { text, converted: 0, api404: Array.from(api404) };

        report(total, 'Finalizado');

        results.sort((a, b) => b.start - a.start);
        let output = text;
        results.forEach((r) => {
            output = output.slice(0, r.start) + r.replace + output.slice(r.end);
        });
        return { text: output, converted: results.length, api404: Array.from(api404) };
    }
    function translateTemplates(text) {
        const summaryNotes = new Set();
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
        const catChanged = catFileResult !== text;
        text = catFileResult;

        const fmtNumResult = normalizeFormatnum(text);
        const fmtChanged = fmtNumResult !== text;
        if (fmtChanged) summaryNotes.add('fmtn');
        text = fmtNumResult;

        const typoFixed = fixCommonPtTypos(text);
        const typoChanged = typoFixed !== text;
        if (typoChanged) summaryNotes.add('ortografia');
        text = typoFixed;

        const alignedInfo = alignInfoTemplates(text);
        if (alignedInfo.changed) summaryNotes.add('alinhamento Info');
        text = alignedInfo.text;

        const refNorm = text.replace(/\n==\s*Refer[eê]ncias\s*==\s*\n\s*\{\{\s*reflist\s*\}\}\s*/i, '\n{{Referências}}\n');
        if (refNorm !== text) summaryNotes.add('referências');
        text = refNorm;

        const summaryParts = [];
        if (templateFixes > 0) summaryParts.push(`templates:${templateFixes}`);
        if (catChanged) summaryParts.push('cat/img');
        if (fmtChanged) summaryParts.push('fmtn');
        if (typoChanged) summaryParts.push('ortografia');
        if (alignedInfo.count) summaryParts.push(`info alinh:${alignedInfo.count}`);
        const summary = summaryParts.length ? 'ajustes: ' + summaryParts.join('; ') : 'ajustes automáticos';
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

        const missingSet = await collectRedLinkTexts();
        if (!missingSet.size) return { text, removed: 0 };

        function normalizeTitleForMissing(val) {
            if (!val) return '';
            const linkMatch = val.match(/\[\[([^\]\|]+)(?:\|[^\]]*)?\]\]/);
            const title = linkMatch ? linkMatch[1] : val;
            return normalizeTitleForMatch(title);
        }

        function pruneRedLinkTemplates(input) {
            const tplNames = new Set([
                'further', 'see also', 'seealso', 'main', 'vt',
                'ver também', 'artigo principal', 'mais info', 'mais informação'
            ].map(normalizeTplName));
            let output = input;
            let pruned = 0;
            const matches = findTemplates(output);
            for (let i = matches.length - 1; i >= 0; i--) {
                const { start, end } = matches[i];
                const raw = output.slice(start, end);
                const inner = raw.slice(2, -2);
                const nameMatch = inner.match(/^\s*([^|]+?)(\|[\s\S]*)?$/);
                if (!nameMatch) continue;
                const rawName = (nameMatch[1] || '').trim();
                const tplNorm = normalizeTplName(rawName);
                if (!tplNames.has(tplNorm)) continue;
                const content = nameMatch[2] ? nameMatch[2].slice(1) : '';
                const parts = splitParamsSafe(content);
                const kept = [];
                parts.forEach((p) => {
                    const m = p.match(/^\s*([^\s=]+)\s*=\s*([\s\S]*)$/);
                    if (m) {
                        kept.push(p);
                        return;
                    }
                    const valNorm = normalizeTitleForMissing(p.trim());
                    if (!valNorm) return;
                    if (missingSet.has(valNorm)) {
                        pruned += 1;
                        return;
                    }
                    kept.push(p);
                });
                if (!kept.length) {
                    output = output.slice(0, start) + '' + output.slice(end);
                    pruned += 1;
                    continue;
                }
                const rebuilt = `{{${rawName}|${kept.join('|')}}}`;
                if (rebuilt !== raw) {
                    output = output.slice(0, start) + rebuilt + output.slice(end);
                }
            }
            return { text: output, pruned };
        }

        const tplPrune = pruneRedLinkTemplates(text);
        text = tplPrune.text;

        const re = /\[\[([^\]\|\n]+)(?:\|([^\]]*))?\]\]/g;
        let removed = tplPrune.pruned || 0;
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
        if (buttonsAdded) return;
        if (!textarea && !isCategoryView && !isUserListView) return;
        buttonsAdded = true;

        if (isCategoryView) {
            addCategoryViewTab();
            addCategoryRefsTab();
        } else if (isUserListView) {
            addUserListViewTab();
        }

        const pageId = mw.config.get('wgArticleId') || mw.config.get('wgPageId');
        const pageExists = !!pageId;

        // Crear toolbar personalizada
        const toolbar = document.createElement('div');
        toolbar.id = 'script-translator-toolbar';
        toolbar.style.cssText = `
            display: flex;
            gap: 8px;
            padding: 10px;
            background: linear-gradient(to bottom, #f8f9fa 0%, #e8e9ea 100%);
            border: 1px solid #a2a9b1;
            border-radius: 4px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        `;

        // Estilo común para botones
        const buttonStyle = `
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid #a2a9b1;
            border-radius: 3px;
            background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
            cursor: pointer;
            transition: all 0.2s ease;
            color: #202122;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const buttonHoverStyle = `
            background: linear-gradient(to bottom, #f8f9fa 0%, #e8e9ea 100%);
            border-color: #72777d;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        `;

        // Botón Traduzir
        const btnTranslate = document.createElement('button');
        btnTranslate.type = 'button';
        btnTranslate.id = 'traduzir-en-pt';
        btnTranslate.innerHTML = '🌐 Traduzir EN→PT';
        btnTranslate.style.cssText = buttonStyle;
        btnTranslate.addEventListener('mouseenter', function () {
            this.style.cssText = buttonStyle + buttonHoverStyle;
        });
        btnTranslate.addEventListener('mouseleave', function () {
            this.style.cssText = buttonStyle;
        });
        btnTranslate.addEventListener('click', async function () {
            const ns = mw.config.get('wgNamespaceNumber');
            if (ns === 14) {
                btnTranslate.disabled = true;
                const original = btnTranslate.innerHTML;
                btnTranslate.innerHTML = '⏳ Traduzindo categoria...';
                const depth = resolveCategoryDepth();
                if (depth === null) {
                    btnTranslate.disabled = false;
                    btnTranslate.innerHTML = original;
                    return;
                }
                try {
                    await translateCategoryMembers(depth);
                } finally {
                    btnTranslate.disabled = false;
                    btnTranslate.innerHTML = original;
                }
                return;
            }
            const result = translateTemplates(textarea.value);
            textarea.value = result.text;
            const summary = document.getElementById('wpSummary');
            if (summary) {
                const note = result.summary || 'ajustes automáticos';
                if (summary.value && !summary.value.includes(note)) summary.value += ', ' + note;
                else if (!summary.value) summary.value = note;
            }
            const diffBtn = document.getElementById('wpDiff');
            if (diffBtn) diffBtn.click();
        });

        // Botón Remover Links Vermelhos
        const btnRedLinks = document.createElement('button');
        btnRedLinks.type = 'button';
        btnRedLinks.id = 'remover-links-vermelhos';
        btnRedLinks.innerHTML = '🔗 Remover artigos vermelhos';
        btnRedLinks.style.cssText = buttonStyle;
        btnRedLinks.disabled = !pageExists;
        btnRedLinks.title = pageExists ? '' : 'Disponível apenas para páginas existentes';
        if (!pageExists) {
            btnRedLinks.style.opacity = '0.5';
            btnRedLinks.style.cursor = 'not-allowed';
        } else {
            btnRedLinks.addEventListener('mouseenter', function () {
                if (!this.disabled) this.style.cssText = buttonStyle + buttonHoverStyle;
            });
            btnRedLinks.addEventListener('mouseleave', function () {
                if (!this.disabled) this.style.cssText = buttonStyle;
            });
        }
        btnRedLinks.addEventListener('click', async function () {
            if (!pageExists || !textarea) return;
            btnRedLinks.disabled = true;
            const originalLabel = btnRedLinks.innerHTML;
            btnRedLinks.innerHTML = '⏳ Verificando links...';
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
                btnRedLinks.innerHTML = originalLabel;
            }
        });

        // Botón Formatar Referências
        const btnFmtRefs = document.createElement('button');
        btnFmtRefs.type = 'button';
        btnFmtRefs.id = 'formatar-referencias';
        btnFmtRefs.innerHTML = '📚 Formatar referências';
        btnFmtRefs.style.cssText = buttonStyle;
        btnFmtRefs.addEventListener('mouseenter', function () {
            if (!this.disabled) this.style.cssText = buttonStyle + buttonHoverStyle;
        });
        btnFmtRefs.addEventListener('mouseleave', function () {
            if (!this.disabled) this.style.cssText = buttonStyle;
        });
            btnFmtRefs.addEventListener('click', async function () {
                if (!textarea) return;
                btnFmtRefs.disabled = true;
                const originalLabel = btnFmtRefs.innerHTML;
                btnFmtRefs.innerHTML = '⏳ Preparando...';
                const progressUI = createProgressUI();
                try {
                    const result = await convertExternalRefs(textarea.value, (done, total, message) => {
                        if (total > 0) {
                            btnFmtRefs.innerHTML = `⏳ Formatando ${done}/${total}`;
                            progressUI.update(done, total, message);
                        }
                }, () => progressUI.isCanceled && progressUI.isCanceled(), { collectApi404: false });
                if (result.converted > 0) {
                    textarea.value = result.text;
                    const summary = document.getElementById('wpSummary');
                    if (summary) {
                        const note = `refs externas (${result.converted})`;
                        if (summary.value && !summary.value.includes(note)) summary.value += ', ' + note;
                        else if (!summary.value) summary.value = note;
                    }
                    mw.notify(`Formatadas ${result.converted} referências externas.`, { type: 'success' });
                } else {
                    mw.notify('Nenhuma referência externa simples encontrada.', { type: 'info' });
                }
                // Sem verificação 404 neste botão
            } catch (e) {
                mw.notify('Falha ao formatar referências externas.', { type: 'error' });
            } finally {
                progressUI.close();
                btnFmtRefs.disabled = false;
                btnFmtRefs.innerHTML = originalLabel;
            }
        });

        // Botón Checar 404
        const btnCheck404 = document.createElement('button');
        btnCheck404.type = 'button';
        btnCheck404.id = 'checar-404-refs';
        btnCheck404.innerHTML = '🔍 Checar 404';
        btnCheck404.style.cssText = buttonStyle;
        btnCheck404.addEventListener('mouseenter', function () {
            if (!this.disabled) this.style.cssText = buttonStyle + buttonHoverStyle;
        });
        btnCheck404.addEventListener('mouseleave', function () {
            if (!this.disabled) this.style.cssText = buttonStyle;
        });
        btnCheck404.addEventListener('click', async function () {
            if (!textarea) return;
            btnCheck404.disabled = true;
            const originalLabel = btnCheck404.innerHTML;
            btnCheck404.innerHTML = '⏳ Verificando...';
            const progressUI = createProgressUI('Verificando 404...');
            try {
                const result = await convertExternalRefs(textarea.value, (done, total, message) => {
                    if (total > 0) {
                        btnCheck404.innerHTML = `⏳ Checando ${done}/${total}`;
                        progressUI.update(done, total, message);
                    }
                }, () => progressUI.isCanceled && progressUI.isCanceled(), { doReplacements: false });
                if (result.api404 && result.api404.length) {
                    showApi404Checklist(result.api404, (checkedUrls) => {
                        if (!checkedUrls || !checkedUrls.length) return;
                        textarea.value = annotateDeadLinks(textarea.value, checkedUrls);
                        mw.notify(`Marcadas ${checkedUrls.length} referências como ligação inativa.`, { type: 'success' });
                    });
                } else {
                    mw.notify('Nenhum 404 encontrado pela API de citação.', { type: 'info' });
                }
            } catch (e) {
                mw.notify('Falha ao checar 404.', { type: 'error' });
            } finally {
                progressUI.close();
                btnCheck404.disabled = false;
                btnCheck404.innerHTML = originalLabel;
            }
        });

        // Agregar botones a la toolbar
        toolbar.appendChild(btnTranslate);
        if (!isCategoryView && textarea) {
            toolbar.appendChild(btnRedLinks);
            toolbar.appendChild(btnFmtRefs);
            toolbar.appendChild(btnCheck404);
        }

        // Insertar toolbar
        if (isCategoryView) {
            const mount = document.getElementById('contentSub') || document.getElementById('mw-content-text') || document.body;
            mount.insertBefore(toolbar, mount.firstChild);
        } else {
            textarea.parentNode.insertBefore(toolbar, textarea);
        }
    }

    if (isCategoryView || isUserListView) {
        addButtons();
    } else if (textarea) {
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
