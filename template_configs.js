// Configuração central de mapeamento por predefinição
// Adicione novas entradas aqui com: nomes alternativos, destino e mapa de parâmetros
// Para campos enumerados, use valueMap: { to: 'destino', valueMap: { 'valor_en': 'valor_pt' } }
   const templateConfigs = [
	{
		    names: ['Infobox'],
		    target: 'Infocaixa',
            preserveOrder: true,
		    singleLine: false,
		    params: {
		        name: 'nome',
		        child: 'child',
		        subbox: 'subbox',
		        'italic title': 'título em itálico',
		        templatestyles: 'templatestyles',
		        'child templatestyles': 'child templatestyles',
		        'grandchild templatestyles': 'grandchild templatestyles',
		
		        bodystyle: 'estilo',
		        titlestyle: 'título-estilo',
		        abovestyle: 'cabeçalho-estilo',
		        subheaderstyle: 'subtítulo-estilo',
		
		        title: 'cabeçalho',
		        above: 'cabeçalho',
		        subheader: 'subtítulo',
		
		        imagestyle: 'imagem-estilo',
		        captionstyle: 'legenda-estilo',
		        image: 'imagem',
		        caption: 'legenda',
		        image2: 'imagem2',
		        caption2: 'legenda2',
		
		        headerstyle: 'tópico-estilo',
		        labelstyle: 'rótulo-estilo',
		        datastyle: 'dados-estilo',
		
		        header1: 'tópico1',
		        label1: 'rótulo1',
		        data1: 'dados1',
		
		        header2: 'tópico2',
		        label2: 'rótulo2',
		        data2: 'dados2',
		
		        header3: 'tópico3',
		        label3: 'rótulo3',
		        data3: 'dados3',
		
		        header4: 'tópico4',
		        label4: 'rótulo4',
		        data4: 'dados4',
		
		        header5: 'tópico5',
		        label5: 'rótulo5',
		        data5: 'dados5',
		
		        header6: 'tópico6',
		        label6: 'rótulo6',
		        data6: 'dados6',
		
		        header7: 'tópico7',
		        label7: 'rótulo7',
		        data7: 'dados7',
		
		        header8: 'tópico8',
		        label8: 'rótulo8',
		        data8: 'dados8',
		
		        header9: 'tópico9',
		        label9: 'rótulo9',
		        data9: 'dados9',
		
		        header10: 'tópico10',
		        label10: 'rótulo10',
		        data10: 'dados10',
		
		        header11: 'tópico11',
		        label11: 'rótulo11',
		        data11: 'dados11',
		
		        header12: 'tópico12',
		        label12: 'rótulo12',
		        data12: 'dados12',
		
		        header13: 'tópico13',
		        label13: 'rótulo13',
		        data13: 'dados13',
		
		        header14: 'tópico14',
		        label14: 'rótulo14',
		        data14: 'dados14',
		
		        header15: 'tópico15',
		        label15: 'rótulo15',
		        data15: 'dados15',
		
		        header16: 'tópico16',
		        label16: 'rótulo16',
		        data16: 'dados16',
		
		        header17: 'tópico17',
		        label17: 'rótulo17',
		        data17: 'dados17',
		
		        header18: 'tópico18',
		        label18: 'rótulo18',
		        data18: 'dados18',
		
		        header19: 'tópico19',
		        label19: 'rótulo19',
		        data19: 'dados19',
		
		        header20: 'tópico20',
		        label20: 'rótulo20',
		        data20: 'dados20',
		
		        belowstyle: 'rodapé-estilo',
		        below: 'rodapé'
		    }
	},
   	{
		    names: ['Infobox legislation'],
		    target: 'Info/Legislação',
		    dateFields: [
		        'aprovadoem1',
		        'promulgadoem1',
		        'aprovadoem2',
		        'promulgadoem2',
		        'assinadoem',
		        'vetadoem',
		        'dataexpiração',
		        'datarevogado',
		        'datareconsideração1',
		        'datareconsideração2'
		    ],
		    singleLine: false,
		    params: {
		        short_title: 'nome_legislação',
		        long_title: 'nomenativo',
		        legislature: 'legislatura',
		        image: 'imagem',
		        caption: 'legenda',
		        citation: 'citação',
		        territorial_extent: 'jurisdição',
		
		        considered_by: 'consideradopor1',
		        enacted_by: 'aprovadopor1',
		        date_passed: 'aprovadoem1',
		        date_enacted: 'promulgadoem1',
		
		        considered_by2: 'consideradopor2',
		        enacted_by2: 'aprovadopor2',
		        date_passed2: 'aprovadoem2',
		        date_enacted2: 'promulgadoem2',
		
		        assented_by: 'assinadopor',
		        date_assented: 'assinadoem',
		        vetoed_by: 'vetadopor',
		        date_vetoed: 'vetadoem',
		        veto_type: 'tipodoveto',
		        veto_overridden: 'vetorejeitado',
		
		        date_of_expiry: 'dataexpiração',
		        date_repealed: 'datarevogado',
		        authorizing_legislation: 'legislaçãoautorizante',
		        administered_by: 'administradopor',
		        white_paper: 'livrobranco',
		
		        bill_history_url: 'históricourl',
		
		        bill: 'nomelei1',
		        bill_citation: 'citaçãolei1',
		        introduced_by: 'apresentadopor1',
		        date_introduced: 'apresentadoem1',
		        committee_responsible: 'comissõesresponsáveis1',
		
		        preliminary_reading: 'leiturapreliminar1',
		        preliminary_reading_for: 'leiturapreliminarafavor1',
		        preliminary_reading_against: 'leiturapreliminarcontra1',
		        preliminary_reading_abstention: 'leiturapreliminarabstenção1',
		        preliminary_reading_absent: 'leiturapreliminarausente1',
		        preliminary_reading_presentnotvoting: 'leiturapreliminarpresentenãovotaram1',
		
		        '1st_reading': 'primeiraleitura1',
		        '1st_reading_for': 'primeiraleituraafavor1',
		        '1st_reading_against': 'primeiraleituracontra1',
		        '1st_reading_abstention': 'primeiraleituraabstenção1',
		        '1st_reading_absent': 'primeiraleituraausente1',
		        '1st_reading_presentnotvoting': 'primeiraleiturapresentenãovotaram1',
		
		        '2nd_reading': 'segundaleitura1',
		        '2nd_reading_for': 'segundaleituraafavor1',
		        '2nd_reading_against': 'segundaleituracontra1',
		        '2nd_reading_abstention': 'segundaleituraabstenção1',
		        '2nd_reading_absent': 'segundaleituraausente1',
		        '2nd_reading_presentnotvoting': 'segundaleiturapresentenãovotaram1',
		
		        '3rd_reading': 'terceiraleitura1',
		        '3rd_reading_for': 'terceiraleituraafavor1',
		        '3rd_reading_against': 'terceiraleituracontra1',
		        '3rd_reading_abstention': 'terceiraleituraabstenção1',
		        '3rd_reading_absent': 'terceiraleituraausente1',
		        '3rd_reading_presentnotvoting': 'terceiraleiturapresentenãovotaram1',
		
		        passed: 'aprovado1',
		        passed_for: 'aprovadoafavor1',
		        passed_against: 'aprovadocontra1',
		        passed_abstention: 'aprovadoabstenção1',
		        passed_absent: 'aprovadoausente1',
		        passed_presentnotvoting: 'aprovadopresentenãovotaram1',
		
		        bill2: 'nomelei2',
		        bill_citation2: 'citaçãolei2',
		        member_in_charge2: 'apresentadopor2',
		        introduced_on2: 'apresentadoem2',
		        committee_responsible2: 'comissõesresponsáveis2',
		
		        preliminary_reading2: 'leiturapreliminar2',
		        preliminary_reading2_for: 'leiturapreliminarafavor2',
		        preliminary_reading2_against: 'leiturapreliminarcontra2',
		        preliminary_reading2_abstention: 'leiturapreliminarabstenção2',
		        preliminary_reading2_absent: 'leiturapreliminarausente2',
		        preliminary_reading2_presentnotvoting: 'leiturapreliminarpresentenãovotaram2',
		
		        '1st_reading2': 'primeiraleitura2',
		        '1st_reading2_for': 'primeiraleituraafavor2',
		        '1st_reading2_against': 'primeiraleituracontra2',
		        '1st_reading2_abstention': 'primeiraleituraabstenção2',
		        '1st_reading2_absent': 'primeiraleituraausente2',
		        '1st_reading2_presentnotvoting': 'primeiraleiturapresentenãovotaram2',
		
		        '2nd_reading2': 'segundaleitura2',
		        '2nd_reading2_for': 'segundaleituraafavor2',
		        '2nd_reading2_against': 'segundaleituracontra2',
		        '2nd_reading2_abstention': 'segundaleituraabstenção2',
		        '2nd_reading2_absent': 'segundaleituraausente2',
		        '2nd_reading2_presentnotvoting': 'segundaleiturapresentenãovotaram2',
		
		        '3rd_reading2': 'terceiraleitura2',
		        '3rd_reading2_for': 'terceiraleituraafavor2',
		        '3rd_reading2_against': 'terceiraleituracontra2',
		        '3rd_reading2_abstention': 'terceiraleituraabstenção2',
		        '3rd_reading2_absent': 'terceiraleituraausente2',
		        '3rd_reading2_presentnotvoting': 'terceiraleiturapresentenãovotaram2',
		
		        passed2: 'aprovado2',
		        passed2_for: 'aprovadoafavor2',
		        passed2_against: 'aprovadocontra2',
		        passed2_abstention: 'aprovadoabstenção2',
		        passed2_absent: 'aprovadoausente2',
		        passed2_presentnotvoting: 'aprovadopresentenãovotaram2',
		
		        date_reconsidered: 'datareconsideração1',
		        veto_override_for: 'vetoafavor1',
		        veto_override_against: 'vetocontra1',
		        veto_override_abstention: 'vetoabstenção1',
		        veto_override_absent: 'vetoausente1',
		        veto_override_presentnotvoting: 'vetopresentenãovotaram1',
		
		        date_reconsidered2: 'datareconsideração2',
		        veto_override2_for: 'vetoafavor2',
		        veto_override2_against: 'vetocontra2',
		        veto_override2_abstention: 'vetoabstenção2',
		        veto_override2_absent: 'vetoausente2',
		        veto_override2_presentnotvoting: 'vetopresentenãovotaram2',
		
		        amends: 'emendas',
		        repeals: 'revogado',
		        amended_by: 'emendadopor',
		        repealed_by: 'revogadopor',
		
		        related_legislation: 'legislaçãorelacionada',
		        related_cases: 'casossupremacorte',
		        supreme_court: 'supremacorte',
		        struck_down_by: 'derrubadopor',
		
		        summary: 'resumo',
		        keywords: 'palavraschave',
		        status: 'estado'
		    }
		},
	   	{
	        names: ['Main'],
	        target: 'Artigo principal',
	        singleLine: true,
	        params: {
	            '1': 'página 1',
	            '2': 'página 2',
	            '3': 'página 3',
	            l1: 'rótulo 1',
	            l2: 'rótulo 2',
	            l3: 'rótulo 3',
	            'label 1': 'rótulo 1',
	            'label 2': 'rótulo 2',
	            'label 3': 'rótulo 3',
	            selfref: 'autorreferência'
	        }
	    },
	    {
	        names: ['See also'],
	        target: 'Ver também',
	        singleLine: true,
	        params: {
	            '1': 'página 1',
	            '2': 'página 2',
	            '3': 'página 3',
	            l1: 'rótulo 1',
	            l2: 'rótulo 2',
	            l3: 'rótulo 3',
	            'label 1': 'rótulo 1',
	            'label 2': 'rótulo 2',
	            'label 3': 'rótulo 3',
	            selfref: 'autorreferência',
	            category: 'categoria'
	        }
	    },
	    {
	        names: ['Infobox officeholder'],
	        target: 'Caixa de informação de ocupante de cargo',
	        dateFields: ['term_start', 'term_end', 'birth_date', 'death_date'],
	        singleLine: false,
	        params: {
	            honorific_prefix: 'prefixo_honorífico',
	            name: 'nome',
	            native_name: 'nome_nativo',
	            native_name_lang: 'código_língua_nativo',
	            honorific_suffix: 'sufixo_honorífico',
	            image: 'imagem',
	            image_size: 'tamanho_imagem',
	            alt: 'alternativo',
	            caption: 'legenda',
	            order: 'ordem',
	            office: 'cargo',
	            term_start: 'início_mandato',
	            term_end: 'fim_mandato',
	            alongside: 'juntamente_com',
	            monarch: 'monarca',
	            president: 'presidente',
	            governor_general: 'governador_geral',
	            primeminister: 'primeiro_ministro',
	            vicepresident: 'vice_presidente',
	            predecessor: 'antecessor',
	            successor: 'sucessor',
	            prior_term: 'mandato_anterior',
	            birth_date: 'data_nascimento',
	            birth_place: 'local_nascimento',
	            death_date: 'data_morte',
	            death_place: 'local_morte',
	            party: 'partido_político',
	            spouse: 'cônjuge',
	            children: 'filhos',
	            signature: 'assinatura'
	        }
	    },
	    {
	        names: ['Infobox military conflict'],
	        target: 'Caixa de informação de conflito militar',
	        dateFields: ['date'],
	        singleLine: false,
	        params: {
	            conflict: 'conflito',
	            partof: 'parte_de',
	            image: 'imagem',
	            image_size: 'tamanho_imagem',
	            alt: 'alternativo',
	            caption: 'legenda',
	            date: 'data',
	            place: 'local',
	            coordinates: 'coordenadas',
	            map_type: 'tipo_mapa',
	            map_caption: 'legenda_mapa',
	            territory: 'território',
	            result: 'resultado',
	            combatant1: 'combatente1',
	            combatant2: 'combatente2',
	            combatant3: 'combatente3',
	            belligerents: 'beligerantes',
	            commander1: 'comandante1',
	            commander2: 'comandante2',
	            strength1: 'força1',
	            strength2: 'força2',
	            casualties1: 'baixas1',
	            casualties2: 'baixas2'
	        }
	    },
	    {
	        names: ['Infobox civil conflict'],
	        target: 'Caixa de informação de conflito civil',
	        dateFields: ['date'],
	        singleLine: false,
	        params: {
	            title: 'título',
	            subtitle: 'subtítulo',
	            partof: 'parte_de',
	            image: 'imagem',
	            caption: 'legenda',
	            date: 'data',
	            place: 'local',
	            coordinates: 'coordenadas',
	            causes: 'causas',
	            goals: 'objetivos',
	            methods: 'métodos',
	            status: 'estado',
	            result: 'resultado',
	            side1: 'lado1',
	            side2: 'lado2',
	            side3: 'lado3',
	            leadfigures1: 'figuras_chave1',
	            leadfigures2: 'figuras_chave2',
	            leadfigures3: 'figuras_chave3',
	            howmany1: 'quantos1',
	            howmany2: 'quantos2',
	            howmany3: 'quantos3',
	            casualties1: 'baixas1',
	            casualties2: 'baixas2',
	            casualties3: 'baixas3',
	            fatalities: 'fatalidades',
	            injuries: 'feridos',
	            arrests: 'detenções',
	            damage: 'danos',
	            notes: 'notas'
	        }
	    },
   		{
		    names: ['Infobox event'],
		    target: 'Info/Evento único',
		    dateFields: ['date', 'data'],
		    singleLine: true,
		    params: {
		        title: 'título',
		        image: 'imagem',
		        image_upright: 'tamanho_imagem',
		        caption: 'legenda',
		        native_name: 'nome_nativo',
		        native_name_lang: 'nome_nativo _lang',
		        english_name: 'nome_português',
		        time: 'hora',
		        duration: 'duração',
		        date: 'data',
		        venue: 'local',
		        location: 'localização',
		        coordinates: 'coordenadas',
		        also_known_as: 'também',
		        type: 'tipo',
		        theme: 'tema',
		        cause: 'causa',
		        target: 'afetados',
		        first_reporter: 'primeiro_repórter',
		        budget: 'orçamento',
		        patron: 'patrono',
		        organisers: 'organizador',
		        filmed_by: 'filmado_por',
		        participants: 'participantes',
		        outcome: 'resultado',
		        casualties1: 'baixas1',
		        casualties2: 'baixas2',
		        casualties3: 'baixas3',
		        reported_deaths: 'mortes',
		        reported_injuries: 'lesões_relatadas',
		        reported_missing: 'desaparecimentos_relatados',
		        burial: 'enterro',
		        inquiries: 'consulta',
		        inquest: 'inquérito',
		        coroner: 'legista',
		        arrests: 'apreensões',
		        suspects: 'suspeitos',
		        accused: 'acusados',
		        convicted: 'condenados',
		        charges: 'acusações',
		        trial: 'julgamento',
		        verdict: 'veredito',
		        convictions: 'condenações',
		        sentence: 'sentenças',
		        publication_bans: 'proibição_de_publicação',
		        litigation: 'litígio',
		        awards: 'prêmios',
		        url: 'url',
		        blank_label: 'rótulo_vazio1',
		        blank1_label: 'rótulo_vazio2',
		        blank2_label: 'rótulo_vazio3',
		        website: 'website',
		        notes: 'abaixo'
		    }
		},
      {
		    names: ['cite web', 'cite_web'],
		    target: 'citar web',
		    dateFields: ['data', 'acessodata', 'arquivodata'],
		    singleLine: true,
		    params: {
		        /* AUTOR 1 */
		        last: 'ultimo',
		        first: 'primeiro',
		        author: 'autor',
		        'author-link': 'autorlink',
		
		        /* AUTOR 2–9 */
		        last2: 'ultimo2',
		        first2: 'primeiro2',
		        'author-link2': 'autorlink2',
		
		        last3: 'ultimo3',
		        first3: 'primeiro3',
		        'author-link3': 'autorlink3',
		
		        last4: 'ultimo4',
		        first4: 'primeiro4',
		        'author-link4': 'autorlink4',
		
		        last5: 'ultimo5',
		        first5: 'primeiro5',
		        'author-link5': 'autorlink5',
		
		        last6: 'ultimo6',
		        first6: 'primeiro6',
		        'author-link6': 'autorlink6',
		
		        last7: 'ultimo7',
		        first7: 'primeiro7',
		        'author-link7': 'autorlink7',
		
		        last8: 'ultimo8',
		        first8: 'primeiro8',
		        'author-link8': 'autorlink8',
		
		        last9: 'ultimo9',
		        first9: 'primeiro9',
		        'author-link9': 'autorlink9',
		
		        /* CONTROLE DA LISTA DE AUTORES */
		        'author-mask': 'autor-mascara',
		        'display-authors': 'numero-autores',
		        'name-list-style': {
		            to: 'ultimoamp',
		            valueMap: {
		                amp: '1'
		            }
		        },
		
		        /* EDITOR 1 */
		        'editor-last': 'editor-sobrenome',
		        'editor-first': 'editor-nome',
		        'editor-link': 'editor-link',
		
		        /* EDITOR 2–9 */
		        'editor2-last': 'editor-sobrenome2',
		        'editor2-first': 'editor-nome2',
		        'editor-link2': 'editor-link2',
		
		        'editor3-last': 'editor-sobrenome3',
		        'editor3-first': 'editor-nome3',
		        'editor-link3': 'editor-link3',
		
		        'editor4-last': 'editor-sobrenome4',
		        'editor4-first': 'editor-nome4',
		        'editor-link4': 'editor-link4',
		
		        'editor5-last': 'editor-sobrenome5',
		        'editor5-first': 'editor-nome5',
		        'editor-link5': 'editor-link5',
		
		        'editor6-last': 'editor-sobrenome6',
		        'editor6-first': 'editor-nome6',
		        'editor-link6': 'editor-link6',
		
		        'editor7-last': 'editor-sobrenome7',
		        'editor7-first': 'editor-nome7',
		        'editor-link7': 'editor-link7',
		
		        'editor8-last': 'editor-sobrenome8',
		        'editor8-first': 'editor-nome8',
		        'editor-link8': 'editor-link8',
		
		        'editor9-last': 'editor-sobrenome9',
		        'editor9-first': 'editor-nome9',
		        'editor-link9': 'editor-link9',
		
		        /* TÍTULO / WEBSITE / EDITORA */
		        title: 'titulo',
		        'script-title': 'titulo-translit',
		        'trans-title': 'titulotrad',
		
		        website: 'website',
		        work: 'obra',
		        publisher: 'publicado',
		        series: 'series',
		        via: 'via',
		
		        /* DATAS */
		        date: { to: 'data', mask: 'dd de MONTH de YYYY' },
		        year: 'ano',
		        'orig-date': 'anooriginal',
		        'publication-date': 'data-publicacao',
		
		        'access-date': { to: 'acessodata', mask: 'dd de MONTH de YYYY' },
		        accessdate: { to: 'acessodata', mask: 'dd de MONTH de YYYY' },

		        'archive-date': { to: 'arquivodata', mask: 'dd de MONTH de YYYY' },
		        archivedate: { to: 'arquivodata', mask: 'dd de MONTH de YYYY' },
		
		        'doi-broken-date': 'doi-broken-date',
		        'lay-date': { to: 'resumo-data', mask: 'dd de MONTH de YYYY' },
		
		        /* LOCAL / PUBLICAÇÃO */
		        place: 'local',
		        location: 'local',
		        'publication-place': 'local-publicacao',
		
		        /* URL / ACESSO / ARQUIVO */
		        url: 'url',
		
		        'url-status': {
		            to: 'urlmorta',
		            valueMap: {
		                dead: 'sim',
		                live: 'não',
		                usurped: 'sim',
		                unfit: 'sim',
		                deviated: 'sim'
		            }
		        },
		
		        'url-access': {
		            to: 'acessourl',
		            valueMap: {
		                registration: 'registo',
		                subscription: 'subscrição',
		                limited: 'limitada'
		            }
		        },
		
		        'archive-url': 'arquivourl',
		        archiveurl: 'arquivourl',
		        'archive-format': 'arquivoformato',
		
		        /* FLAGS DE REGISTO / SUBSCRIÇÃO (booleans simples) */
		        subscription: 'subscricao',
		        registration: 'registo',
		
		        /* PÁGINAS */
		        page: 'pagina',
		        pages: 'paginas',
		        at: 'em',
		        'no-pp': 'nopp',
		
		        /* IDIOMA */
		        language: 'lingua',
		        lang: 'lingua',
		
		        /* TIPO / FORMATO / EDIÇÃO */
		        type: 'tipo',
		        medium: 'tipo',
		        format: 'formato',
		        edition: 'edicao',
		        df: 'df', /* se existir suporte no módulo */
		
		        /* IDENTIFICADORES (1:1) */
		        arxiv: 'arxiv',
		        asin: 'asin',
		        'asin-tld': 'asin-tld',
		        bibcode: 'bibcode',
		        biorxiv: 'biorxiv',
		        citeseerx: 'citeseerx',
		        doi: 'doi',
		        isbn: 'isbn',
		        issn: 'issn',
		        jfm: 'jfm',
		        jstor: 'jstor',
		        lccn: 'lccn',
		        mr: 'mr',
		        oclc: 'oclc',
		        ol: 'ol',
		        osti: 'osti',
		        pmc: 'pmc',
		        pmid: 'pmid',
		        rfc: 'rfc',
		        ssrn: 'ssrn',
		        zbl: 'zbl',
		        id: 'id',
		
		        /* NÍVEL DE ACESSO DOS IDENTIFICADORES */
		        'bibcode-access': 'bibcode-access',
		        'doi-access': 'doi-access',
		        'hdl-access': 'hdl-access',
		        'jstor-access': 'jstor-access',
		        'ol-access': 'ol-access',
		        'osti-access': 'osti-access',
		
		        /* OUTROS CAMPOS DE CONTEÚDO */
		        others: 'outros',
		        quote: 'citacao',
		        'trans-quote': 'trans-quote',
		        ref: 'ref',
		        postscript: 'pontofinal',
		        separator: 'separador',
		        agency: 'agency',
		
		        /* RESUMO / LAY SUMMARY */
		        'lay-url': 'resumo-url',
		        layurl: 'resumo-url',
		        'lay-source': 'resumo-fonte',
		        laysource: 'resumo-fonte',
		        'lay-date': 'resumo-data',
		        laydate: 'resumo-data'
		    }
		},
        {
		    names: ['cite journal'],
		    target: 'citar periódico',
		    dateFields: [
		        'data',
		        'acessodata',
		        'data-publicacao',
		        'arquivodata',
		        'resumo-data',
		        'doi-broken-date'
		    ],
		    singleLine: true,
		    params: {
		        /* Autores (1) */
		        last: 'ultimo',
		        first: 'primeiro',
		        author: 'autor',
		        'author-link': 'autorlink',
		
		        /* Autores (2–9) */
		        last2: 'ultimo2',
		        first2: 'primeiro2',
		        author2: 'autor2',
		        'author-link2': 'autorlink2',
		
		        last3: 'ultimo3',
		        first3: 'primeiro3',
		        author3: 'autor3',
		        'author-link3': 'autorlink3',
		
		        last4: 'ultimo4',
		        first4: 'primeiro4',
		        author4: 'autor4',
		        'author-link4': 'autorlink4',
		
		        last5: 'ultimo5',
		        first5: 'primeiro5',
		        author5: 'autor5',
		        'author-link5': 'autorlink5',
		
		        last6: 'ultimo6',
		        first6: 'primeiro6',
		        author6: 'autor6',
		        'author-link6': 'autorlink6',
		
		        last7: 'ultimo7',
		        first7: 'primeiro7',
		        author7: 'autor7',
		        'author-link7': 'autorlink7',
		
		        last8: 'ultimo8',
		        first8: 'primeiro8',
		        author8: 'autor8',
		        'author-link8': 'autorlink8',
		
		        last9: 'ultimo9',
		        first9: 'primeiro9',
		        author9: 'autor9',
		        'author-link9': 'autorlink9',
		
		        /* Opções de lista de autores */
		        'display-authors': 'numero-autores',
		        vauthors: 'vauthors',
		        'author-mask': 'autor-mascara',
		        authors: 'autores',
		
		        /* Editores (1) */
		        'editor-last': 'editor-sobrenome',
		        'editor-first': 'editor-nome',
		        'editor-link': 'editor-link',
		
		        /* Editores (2–9) */
		        'editor2-last': 'editor-sobrenome2',
		        'editor2-first': 'editor-nome2',
		        'editor2-link': 'editor-link2',
		
		        'editor3-last': 'editor-sobrenome3',
		        'editor3-first': 'editor-nome3',
		        'editor3-link': 'editor-link3',
		
		        'editor4-last': 'editor-sobrenome4',
		        'editor4-first': 'editor-nome4',
		        'editor4-link': 'editor-link4',
		
		        'editor5-last': 'editor-sobrenome5',
		        'editor5-first': 'editor-nome5',
		        'editor5-link': 'editor-link5',
		
		        'editor6-last': 'editor-sobrenome6',
		        'editor6-first': 'editor-nome6',
		        'editor6-link': 'editor-link6',
		
		        'editor7-last': 'editor-sobrenome7',
		        'editor7-first': 'editor-nome7',
		        'editor7-link': 'editor-link7',
		
		        'editor8-last': 'editor-sobrenome8',
		        'editor8-first': 'editor-nome8',
		        'editor8-link': 'editor-link8',
		
		        'editor9-last': 'editor-sobrenome9',
		        'editor9-first': 'editor-nome9',
		        'editor9-link': 'editor-link9',
		
		        /* Datas básicas */
		        date: 'data',
		        year: 'ano',
		        'orig-date': 'anooriginal',
		
		        /* Títulos */
		        title: 'título',
		        'script-title': 'titulo-translit',
		        'trans-title': 'titulotrad',
		
		        /* Periódico / obra */
		        journal: 'periódico',
		        work: 'periódico',
		        series: 'series',
		        department: 'departamento',
		
		        /* Idioma */
		        language: 'lingua',
		
		        /* Local, editora, publicação */
		        location: 'local',
		        place: 'local',
		        publisher: 'publicado',
		        'publication-place': 'local-publicacao',
		        'publication-date': 'data-publicacao',
		
		        /* Edição */
		        edition: 'edicao',
		
		        /* Volume / número */
		        volume: 'volume',
		        issue: 'número',
		
		        /* Páginas */
		        page: 'pagina',
		        pages: 'paginas',
		        at: 'em',
		        'no-pp': 'nopp',
		
		        /* Tipo / meio / formato */
		        type: 'tipo',
		        medium: 'tipo',
		        format: 'formato',
		
		        /* URL principal */
		        url: 'url',
		
		        /* Status da URL */
		        'url-status': {
		            to: 'urlmorta',
		            valueMap: {
		                dead: 'sim',
		                live: 'não',
		                usurped: 'sim',
		                unfit: 'sim',
		                deviated: 'sim'
		            }
		        },
		
		        /* Acesso / arquivamento */
		        'access-date': 'acessodata',
		        'archive-url': 'arquivourl',
		        'archive-date': 'arquivodata',
		        'archive-format': 'arquivoformato',
		
		        /* Nível de acesso ao URL */
		        'url-access': {
		            to: 'acessourl',
		            valueMap: {
		                registration: 'registo',
		                subscription: 'subscrição',
		                limited: 'limitada'
		            }
		        },
		
		        /* Citação / transcrição */
		        quote: 'citacao',
		        ref: 'ref',
		        separator: 'separador',
		        postscript: 'pontofinal',
		
		        /* Resumo leigo / lay summary (quando presente em Cite_journal) */
		        'lay-url': 'resumo-url',
		        'lay-source': 'resumo-fonte',
		        'lay-date': 'resumo-data',
		
		        /* Identificadores diversos */
		        arxiv: 'arxiv',
		        asin: 'asin',
		        'asin-tld': 'asin-tld',
		        bibcode: 'bibcode',
		        biorxiv: 'biorxiv',
		        citeseerx: 'citeseerx',
		        doi: 'doi',
		        'doi-broken-date': 'doi-broken-date',
		        hdl: 'hdl',
		        isbn: 'isbn',
		        issn: 'issn',
		        eissn: 'eissn',
		        jfm: 'jfm',
		        jstor: 'jstor',
		        lccn: 'lccn',
		        mr: 'mr',
		        oclc: 'oclc',
		        ol: 'ol',
		        osti: 'osti',
		        pmc: 'pmc',
		        pmid: 'pmid',
		        rfc: 'rfc',
		        s2cid: 's2cid',
		        ssrn: 'ssrn',
		        zbl: 'zbl',
		        id: 'id',
		
		        /* Níveis de acesso de identificadores */
		        'bibcode-access': 'bibcode-access',
		        'doi-access': 'doi-access',
		        'hdl-access': 'hdl-access',
		        'jstor-access': 'jstor-access',
		        'ol-access': 'ol-access',
		        'osti-access': 'osti-access',
		
		        /* Via / provedor */
		        via: 'via'
		    }
        },
        {
              names: ['cite book', 'cite_book'],
              target: 'citar livro',
              dateFields: ['data', 'acessodata', 'data-publicacao', 'arquivodata', 'resumo-data'],
              singleLine: true,
              params: {
                /* título / obra / editora */
                title: 'título',
                titulo: 'título',
                subtitle: 'subtítulo',
                subtitulo: 'subtítulo',
                work: 'obra',
                publisher: 'editora',
                published: 'editora',
                publishedby: 'editora',
                published_by: 'editora',
                others: 'outros',

                /* datas principais */
                date: { to: 'data', mask: 'dd de MONTH de YYYY' },
                year: 'ano',
                'publication-date': { to: 'data-publicacao', mask: 'dd de MONTH de YYYY' },
                'publication year': 'ano',
                'publication-year': 'ano',
                'orig-year': 'anooriginal',
                'origyear': 'anooriginal',

                /* localização, edição, série, volume */
                location: 'local',
                place: 'local',
                'publication-place': 'local-publicacao',
                'publicationplace': 'local-publicacao',
                edition: 'edicao',
                series: 'series',
                volume: 'volume',

                /* paginação */
			    page: 'página',
			    pages: 'páginas',
			    'total-pages': 'total-páginas',
                nopp: 'nopp',
                at: 'em',

                /* idioma / título traduzido / transliterado */
                language: 'lingua',
                idioma: 'lingua',
                'script-title': 'titulo-translit',
                'trans-title': 'titulotrad',
                'translated-title': 'titulotrad',

                /* capítulo */
                chapter: 'capitulo',
                'trans-chapter': 'trad-capitulo',
                'chapter-url': 'capitulourl',
			
			    /* tipo / formato */
			    type: 'tipo',
                format: 'formato',

                /* identificadores */
                arxiv: 'arxiv',
                asin: 'asin',
                'asin-tld': 'asin-tld',
                bibcode: 'bibcode',
                doi: 'doi',
                'doi-broken-date': { to: 'doi-broken-date', mask: 'DD-MM-YYYY' },
                isbn: 'isbn',
                issn: 'issn',
                eissn: 'eissn',
                jfm: 'jfm',
                jstor: 'jstor',
                lccn: 'lccn',
                mr: 'mr',
                oclc: 'oclc',
                ol: 'ol',
                osti: 'osti',
                pmc: 'pmc',
                pmid: 'pmid',
                rfc: 'rfc',
                ssrn: 'ssrn',
                zbl: 'zbl',
                id: 'id',

                /* URL / arquivo / acesso */
                url: 'url',
                'access-date': { to: 'acessodata', mask: 'DD-MM-YYYY' },
                accessdate: { to: 'acessodata', mask: 'DD-MM-YYYY' },
                'orig-date': { to: 'anooriginal', mask: 'YYYY' },
                'archive-url': 'arquivourl',
                'archive-date': { to: 'arquivodata', mask: 'DD-MM-YYYY' },
                'archiveurl': 'arquivourl',
                'archivedate': { to: 'arquivodata', mask: 'DD-MM-YYYY' },
                'url-status': {
                  to: 'urlmorta',
                  valueMap: {
                    dead: 'sim',
                    live: 'não',
                    usurped: 'sim',
                    unfit: 'sim',
                    deviated: 'sim'
                  }
                },
                'url-access': {
                  to: 'subscricao',
                  valueMap: {
                    subscription: 's',
                    registration: 's',
                    limited: 's'
                  }
                },
                subscription: {
                  to: 'subscricao',
                  valueMap: {
                    yes: 's',
                    sim: 's',
                    s: 's',
                    true: 's'
                  }
                },
			
			    /* resumo leigo (lay summary) */
                'lay-url': 'url-resumo',
                'lay-source': 'resumo-fonte',
                'lay-date': { to: 'resumo-data', mask: 'DD-MM-YYYY' },

                /* citação, ref, estilo */
                quote: 'citacao',
                ref: 'ref',
                'name-list-style': 'formato-lista-nomes',
                mode: 'modo',
                postscript: 'pontofinal',
                'last-author-amp': 'ultimoamp',

                /* autores */
                last: 'ultimo',
                last1: 'ultimo',
                author: 'ultimo',
                author1: 'ultimo',
                'author-last': 'ultimo',
                'author-last1': 'ultimo',
                surname: 'ultimo',
                surname1: 'ultimo',
                apelido: 'ultimo',
                apelido1: 'ultimo',
                apellidos: 'ultimo',
                last2: 'ultimo2',
                author2: 'ultimo2',
                'author-last2': 'ultimo2',
                surname2: 'ultimo2',
                last3: 'ultimo3',
                author3: 'ultimo3',
                'author-last3': 'ultimo3',
                surname3: 'ultimo3',
                last4: 'ultimo4',
                author4: 'ultimo4',
                'author-last4': 'ultimo4',
                surname4: 'ultimo4',
                last5: 'ultimo5',
                author5: 'ultimo5',
                'author-last5': 'ultimo5',
                surname5: 'ultimo5',
                last6: 'ultimo6',
                author6: 'ultimo6',
                'author-last6': 'ultimo6',
                surname6: 'ultimo6',
                last7: 'ultimo7',
                author7: 'ultimo7',
                'author-last7': 'ultimo7',
                surname7: 'ultimo7',
                last8: 'ultimo8',
                author8: 'ultimo8',
                'author-last8': 'ultimo8',
                surname8: 'ultimo8',
                last9: 'ultimo9',
                author9: 'ultimo9',
                'author-last9': 'ultimo9',
                surname9: 'ultimo9',

                first: 'primeiro',
                first1: 'primeiro',
                nome: 'primeiro',
                nome1: 'primeiro',
                'author-first': 'primeiro',
                'author-first1': 'primeiro',
                given: 'primeiro',
                first2: 'primeiro2',
                nome2: 'primeiro2',
                'author-first2': 'primeiro2',
                first3: 'primeiro3',
                nome3: 'primeiro3',
                'author-first3': 'primeiro3',
                first4: 'primeiro4',
                nome4: 'primeiro4',
                'author-first4': 'primeiro4',
                first5: 'primeiro5',
                nome5: 'primeiro5',
                'author-first5': 'primeiro5',
                first6: 'primeiro6',
                nome6: 'primeiro6',
                'author-first6': 'primeiro6',
                first7: 'primeiro7',
                nome7: 'primeiro7',
                'author-first7': 'primeiro7',
                first8: 'primeiro8',
                nome8: 'primeiro8',
                'author-first8': 'primeiro8',
                first9: 'primeiro9',
                nome9: 'primeiro9',
                'author-first9': 'primeiro9',

                'author-mask2': 'autor-mascara2',
                'author-mask3': 'autor-mascara3',
                'author-mask4': 'autor-mascara4',
                'author-mask5': 'autor-mascara5',
			    'author-mask6': 'autor-mascara6',
			    'author-mask7': 'autor-mascara7',
			    'author-mask8': 'autor-mascara8',
			    'author-mask9': 'autor-mascara9',
			    'display-authors': 'numero-autores',
			
			    'author-link': 'autorlink',
			    'author-link2': 'autorlink2',
			    'author-link3': 'autorlink3',
			    'author-link4': 'autorlink4',
			    'author-link5': 'autorlink5',
			    'author-link6': 'autorlink6',
                'author-link7': 'autorlink7',
                'author-link8': 'autorlink8',
                'author-link9': 'autorlink9',

                /* editores */
                'editor-last': 'editor-sobrenome',
                'editor-first': 'editor-nome',
                'editor-link': 'editor-link',

                'editor-last2': 'editor-sobrenome2',
                'editor-first2': 'editor-nome2',
                'editor-link2': 'editor-link2',

                'editor-last3': 'editor-sobrenome3',
                'editor-first3': 'editor-nome3',
                'editor-link3': 'editor-link3',

                'editor-last4': 'editor-sobrenome4',
                'editor-first4': 'editor-nome4',
                'editor-link4': 'editor-link4',

                'editor-last5': 'editor-sobrenome5',
                'editor-first5': 'editor-nome5',
                'editor-link5': 'editor-link5',

                'editor-last6': 'editor-sobrenome6',
                'editor-first6': 'editor-nome6',
                'editor-link6': 'editor-link6',

                'editor-last7': 'editor-sobrenome7',
                'editor-first7': 'editor-nome7',
                'editor-link7': 'editor-link7',

                'editor-last8': 'editor-sobrenome8',
                'editor-first8': 'editor-nome8',
                'editor-link8': 'editor-link8',

                'editor-last9': 'editor-sobrenome9',
                'editor-first9': 'editor-nome9',
                'editor-link9': 'editor-link9'
              }
            },
        { 
            names: ['cite conference', 'cite_conference'], 
            target: 'citar congresso', 
            dateFields: ['data', 'acessodata'], 
            singleLine: true,
            params: { 
                title: 'título', 
                booktitle: 'título-livro', 
                conference: 'congresso', 
                date: { to: 'data', mask: 'dd de MONTH de YYYY' }, 
                year: 'ano', 
                publisher: 'editora', 
                location: 'local', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'dd de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite interview', 'cite_interview'], 
            target: 'citar entrevista', 
            dateFields: ['data'], 
            singleLine: true,
            params: { 
                subject: 'entrevistado', 
                title: 'título', 
                interviewer: 'entrevistador', 
                date: { to: 'data', mask: 'dd de MONTH de YYYY' }, 
                medium: 'meio', 
                location: 'local', 
                publisher: 'publicado', 
                url: 'url' 
            } 
        },
        { 
            names: ['cite thesis', 'cite_thesis'], 
            target: 'citar tese', 
            dateFields: ['data', 'acessodata'], 
            singleLine: true,
            params: { 
                title: 'título', 
                date: { to: 'data', mask: 'dd de MONTH de YYYY' }, 
                degree: 'grau', 
                department: 'departamento', 
                university: 'universidade', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'dd de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite document', 'cite_document'], 
            target: 'citar documento', 
            dateFields: ['data', 'acessodata'], 
            singleLine: true,
            params: { 
                title: 'título', 
                date: { to: 'data', mask: 'dd de MONTH de YYYY' }, 
                type: 'tipo', 
                publisher: 'publicado', 
                institution: 'instituição', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'dd de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite encyclopedia', 'cite_encyclopedia'], 
            target: 'citar enciclopédia', 
            dateFields: ['data', 'acessodata'], 
            singleLine: true,
            params: { 
                title: 'título', 
                encyclopedia: 'enciclopédia', 
                date: { to: 'data', mask: 'dd de MONTH de YYYY' }, 
                publisher: 'editora', 
                location: 'local', 
                volume: 'volume', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'dd de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        {
            names: ['infobox person'],
            target: 'Info/Biografia',
            dateFields: ['nascimento_data', 'morte_data'],
            params: {
                name: 'nome',
                native_name: 'nome_nativo',
                native_name_lang: 'nome_nativo_lang',
                birth_name: 'nome_nascimento',
                birth_date: { to: 'nascimento_data', mask: 'dd de MONTH de YYYY' },
                birth_place: 'nascimento_local',
                death_date: { to: 'morte_data', mask: 'dd de MONTH de YYYY' },
                death_place: 'morte_local',
                death_cause: 'causa_morte',
                resting_place: 'enterro_local',
                burial_place: 'enterro_local',
                citizenship: 'cidadania',
                nationality: 'nacionalidade',
                education: 'educação',
                alma_mater: 'alma_mater',
                occupation: 'ocupação',
                years_active: 'período_atividade',
                employer: 'empregador',
                organization: 'afiliações',
                agent: 'agência',
                known_for: 'conhecido_por',
                notable_works: 'principais_trabalhos',
                awards: 'principais_prêmios',
                other_names: 'outros_nomes',
                height: 'altura',
                spouse: 'cônjuge',
                partner: 'cônjuge',
                children: 'filhos',
                parents: 'parentesco',
                mother: 'nome_mãe',
                father: 'nome_pai',
                relatives: 'parentesco',
                family: 'parentesco',
                website: 'site_oficial',
                signature: 'assinatura',
                footnotes: 'rodapé',
                image_upright: 'imagem_tamanho',
                caption: 'imagem_legenda'
            }
        },
        {
            names: ['Infobox person', 'infobox_person', 'Infobox_person'],
            target: 'Info/Biografia',
            dateFields: ['data_nascimento', 'data_morte'],
            params: {
            name: 'nome',
            image: 'imagem',
            caption: 'legenda',
            birth_name: 'nome_completo',
            birth_date: {
                to: 'data_nascimento',
                mask: 'dd de MONTH de YYYY'
            },
            birth_place: 'local_nascimento',
            death_date: {
                to: 'data_morte',
                mask: 'dd de MONTH de YYYY'
            },
            death_place: 'local_morte',
            occupation: 'ocupação',
            website: 'website'
            }
        },
        {
            names: ['Infobox film', 'infobox_film'],
            target: 'Info/Filme',
            dateFields: ['lançamento'],
            params: {
            name: 'nome_original',
            director: 'diretor',
            producer: 'produtor',
            writer: 'roteirista',
            starring: 'elenco',
            music: 'música',
            released: {
                to: 'lançamento',
                mask: 'dd de MONTH de YYYY'
            },
            runtime: 'duração',
            country: 'país',
            language: 'língua',
            budget: 'orçamento',
            box_office: 'receita'
            }
        },
        {
            names: ['Infobox album', 'infobox_album'],
            target: 'Info/Álbum',
            dateFields: ['lançamento', 'gravação'],
            params: {
            name: 'nome',
            type: 'tipo',
            artist: 'artista',
            released: {
                to: 'lançamento',
                mask: 'dd de MONTH de YYYY'
            },
            recorded: {
                to: 'gravação',
                mask: 'dd de MONTH de YYYY'
            },
            genre: 'gênero',
            label: 'gravadora',
            producer: 'produtor',
            length: 'duração',
            cover: 'capa'
            }
        },
        {
            names: ['Infobox settlement', 'infobox_settlement'],
            target: 'Info/Localidade',
            dateFields: ['data_fundação'],
            params: {
            official_name: 'nome_oficial',
            image_flag: 'bandeira',
            subdivision_type: 'país',
            subdivision_name: 'nome_país',
            population_total: 'população',
            area_total_km2: 'área_total_km2',
            elevation_m: 'altitude_m',
            established_date: {
                to: 'data_fundação',
                mask: 'dd de MONTH de YYYY'
            },
            timezone: 'fuso_horário'
            }
        },
        {
            names: ['Infobox company', 'infobox_company'],
            target: 'Info/Empresa',
            dateFields: ['fundação'],
            params: {
            company_name: 'nome_empresa',
            logo: 'logo',
            industry: 'indústria',
            founded: {
                to: 'fundação',
                mask: 'dd de MONTH de YYYY'
            },
            headquarters: 'sede',
            area_served: 'serviços',
            products: 'produtos',
            revenue: 'receita',
            num_employees: 'empregados',
            website: 'website'
            }
        },
        {
            names: ['Infobox television', 'infobox_television'],
            target: 'Info/Série de televisão',
            dateFields: ['lançamento'],
            params: {
            show_name: 'título',
            image: 'imagem',
            caption: 'legenda',
            format: 'formato',
            creator: 'criador',
            starring: 'elenco',
            country: 'país_origem',
            num_seasons: 'número_temporadas',
            num_episodes: 'número_episódios',
            first_aired: {
                to: 'lançamento',
                mask: 'dd de MONTH de YYYY'
            },
            network: 'emissora'
            }
        },
        {
            names: ['Infobox organization', 'infobox_organization'],
            target: 'Info/Organização',
            dateFields: ['fundação'],
            params: {
            name: 'nome',
            logo: 'logótipo',
            formation: {
                to: 'fundação',
                mask: 'dd de MONTH de YYYY'
            },
            type: 'tipo',
            headquarters: 'sede',
            area_served: 'área_servida',
            key_people: 'pessoas_chave',
            website: 'website'
            }
        },
        {
            names: ['Infobox software', 'infobox_software'],
            target: 'Info/Software',
            dateFields: ['data_lançamento'],
            params: {
            name: 'nome',
            logo: 'logotipo',
            caption: 'legenda',
            developer: 'desenvolvedor',
            latest_release_version: 'última_versão',
            latest_release_date: {
                to: 'data_lançamento',
                mask: 'dd de MONTH de YYYY'
            },
            operating_system: 'sistema_operacional',
            genre: 'gênero',
            license: 'licença',
            website: 'website'
            }
        },
        {
            names: ['Infobox sportsperson', 'infobox_sportsperson'],
            target: 'Info/Desportista',
            dateFields: ['data_nascimento'],
            params: {
            name: 'nome',
            image: 'imagem',
            full_name: 'nome_completo',
            birth_date: {
                to: 'data_nascimento',
                mask: 'dd de MONTH de YYYY'
            },
            birth_place: 'local_nascimento',
            height: 'altura',
            weight: 'peso',
            sport: 'desporto',
            country: 'país'
            }
        },
        {
            names: ['Infobox military conflict', 'infobox_military_conflict'],
            target: 'Info/Conflito militar',
            dateFields: ['data'],
            params: {
            conflict: 'conflito',
            partof: 'parte_de',
            date: {
                to: 'data',
                mask: 'dd de MONTH de YYYY'
            },
            place: 'local',
            result: 'resultado',
            combatant1: 'combatente1',
            combatant2: 'combatente2',
            commander1: 'comandante1',
            commander2: 'comandante2',
            casualties1: 'baixas1',
            casualties2: 'baixas2'
            }
        },
        {
            names: ['Infobox civil conflict', 'Infobox_civil_conflict'],
            target: 'Info/conflito civil',
            dateFields: ['período'],
            params: {
                // básicos
                title: 'título',
                partof: 'subconflitode',
                image: 'imagem',
                caption: 'legenda',
                date: { to: 'período', mask: 'dd de MONTH de YYYY' },
                place: 'local',
                coordinates: 'coordenadas',
                causes: 'causas',
                goals: 'objetivos',
                methods: 'métodos',
                status: 'situação',
                result: 'resultado',

                // lados/participantes
                side1: 'lado1',
                side2: 'lado2',
                side3: 'lado3',

                // líderes
                leadfigures1: 'líderes1',
                leadfigures2: 'líderes2',
                leadfigures3: 'líderes3',

                // números/totais
                howmany1: 'total1',
                howmany2: 'total2',
                howmany3: 'total3',

                // baixas
                casualties1: 'baixas1',
                casualties2: 'baixas2',
                casualties3: 'baixas3',
                casualties_label: 'legenda_baixas',

                // outros
                notes: 'notas',

            }
        }
    ];
