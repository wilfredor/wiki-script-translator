# Tradutor de templates EN→PT

User script que traduz predefinições (referências e infoboxes) do inglês para o português diretamente no editor da wiki.

## Como funciona
- Adiciona o botão `Traduzir EN→PT` ao editar artigos.
- Converte o nome do template, traduz parâmetros conforme `template_configs.js` e ordena-os alfabeticamente.
- Normaliza datas comuns para o formato português.
- Mantém referências em uma única linha quando `singleLine` está marcado para aquela predefinição.
- Permite mapear valores enumerados (por exemplo, campos que aceitam apenas valores de lista) via `valueMap`.
- Permite preservar ou definir ordem customizada de parâmetros (`preserveOrder` ou `paramOrder`).
- Permite mapear parâmetros posicionais (sem nome) via `positional`.

## Instalação
1) Copie `template_configs.js` para sua página de scripts na wiki (ex.: `Usuário(a):Você/template configs.js`).  
2) Copie `script_translator.js` para seu `common.js` (ou outro módulo que você carregue) e ajuste o caminho do `importScript` para o arquivo do passo anterior:
```js
importScript('Usuário(a):Você/template configs.js');
```

## Ajustando as configurações
Cada entrada em `template_configs.js` segue esta estrutura:
```js
{
  names: ['cite web', 'cite_web'], // nomes equivalentes do template de origem
  target: 'citar web',             // nome da predefinição destino
  dateFields: ['data', 'acessodata'],
  singleLine: true,                // força a referência a ficar em uma linha
  preserveOrder: true,             // (opcional) mantém a ordem original dos parâmetros
  // ou defina uma ordem explícita:
  // paramOrder: ['título', 'autor', 'data'],
  // para parâmetros sem nome (posicionais), siga a ordem recebida
  // positional: [{ to: '1' }, { to: '2', valueMap: { 'old': 'novo' } }],
  params: {
    title: 'título',               // mapeia nome do parâmetro
    date: { to: 'data', mask: 'DD de MONTH de YYYY' }, // aplica máscara de data
    format: {                      // exemplo de enum mapeado
      to: 'formato',
      valueMap: { online: 'on-line', print: 'impresso' }
    }
  }
}
```

### Campos úteis
- `names`: variações do template de origem que serão detectadas.
- `target`: nome da predefinição em português.
- `dateFields`: lista de parâmetros que devem ter datas normalizadas.
- `singleLine`: se `true`, remove quebras de linha ao reconstruir a predefinição.
- `params`:
  - `string`: renomeia o parâmetro (`title: 'título'`).
  - `to`: renomeia o parâmetro (`{ to: 'título' }`).
  - `mask`: aplica máscara a datas quando contém dia e ano (`{ to: 'data', mask: 'DD de MONTH de YYYY' }`).
  - `valueMap`: traduz valores enumerados (`{ to: 'formato', valueMap: { online: 'on-line' } }`).

## Fluxo de uso
1) Abra uma página para editar.  
2) Clique em `Traduzir EN→PT`.  
3) O texto do editor será convertido; o sumário receberá a nota de tradução e o botão de diff será acionado automaticamente (se existir).
