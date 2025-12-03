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

    function applyTemplateConfigs(text) {
        templateConfigs.forEach((cfg) => {
            const namesPattern = cfg.names.map(escapeRegExp).join('|');
            const tplRe = new RegExp(`\\{\\{\\s*(?:${namesPattern})([\\s\\S]*?)\\}\\}`, 'ig');
            text = text.replace(tplRe, function (match, content) {
                // divide por parâmetros
                const parts = content.split('|');
                const head = parts.shift() || '';
                const mapped = [];
                const others = [];
                const dateSet = new Set([...(cfg.dateFields || []), ...dateParamsPt]);

                parts.forEach((part) => {
                    // preserva o separador inicial
                    const fullPart = '|' + part;
                    const m = part.match(/^\s*([^\s=]+)\s*=\s*([\s\S]*)$/);
                    if (!m) {
                        others.push(fullPart);
                        return;
                    }
                    const origName = m[1];
                    const value = m[2];
                    const cleanValue = value.trim();
                    const paramCfg = cfg.params[origName];
                    const mappedName = typeof paramCfg === 'object' ? (paramCfg.to || paramCfg) : (paramCfg || origName);
                    let mappedValue = value;
                    if (paramCfg && typeof paramCfg === 'object' && paramCfg.mask) {
                        const parts = parseDateParts(cleanValue);
                        const hasDayYear = parts && parts.dd && parts.yyyy;
                        const masked = hasDayYear ? applyDateMask(parts, paramCfg.mask) : null;
                        mappedValue = masked || normalizeDate(cleanValue) || value;
                    } else if (dateSet.has(mappedName)) {
                        const normalized = normalizeDate(cleanValue);
                        mappedValue = normalized || value;
                    }
                    mapped.push({ name: mappedName, value: mappedValue });
                });

                mapped.sort((a, b) => a.name.localeCompare(b.name, 'pt'));

                let rebuilt = `{{${cfg.target}${head}`;
                mapped.forEach(({ name, value }) => {
                    rebuilt += '|' + name + '=' + value;
                });
                others.forEach((p) => {
                    rebuilt += p;
                });
                rebuilt += '}}';
                return rebuilt;
            });
        });
        return text;
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

    function translateTemplates(text) {
        // Aplica mapeamentos específicos por predefinição
        text = applyTemplateConfigs(text);
        text = translateDates(text);
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
