    // Configuração central de mapeamento por predefinição
    // Adicione novas entradas aqui com: nomes alternativos, destino e mapa de parâmetros
   const templateConfigs = [
        {
            names: ['cite web', 'cite_web'],
            target: 'citar web',
            dateFields: ['data', 'acessodata', 'arquivodata'],
            params: {
                title: 'título',
                work: 'obra',
                publisher: 'publicado',
                website: 'website',
                date: { to: 'data', mask: 'DD de MONTH de YYYY' },
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' },
                archiveurl: 'arquivourl',
                archivedate: { to: 'arquivodata', mask: 'DD de MONTH de YYYY' },
                urlstatus: 'urlmorta',
                language: 'língua',
                author: 'autor',
                last: 'último',
                first: 'primeiro'
            }
        },
        {
            names: ['cite news', 'cite newspaper'],
            target: 'citar jornal',
            dateFields: ['data', 'acessodata', 'arquivodata'],
            params: {
                title: 'título',
                newspaper: 'jornal',
                work: 'obra',
                publisher: 'publicado',
                date: { to: 'data', mask: 'DD de MONTH de YYYY' },
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' },
                archiveurl: 'arquivourl',
                archivedate: { to: 'arquivodata', mask: 'DD de MONTH de YYYY' },
                urlstatus: 'urlmorta',
                language: 'língua',
                author: 'autor',
                last: 'último',
                first: 'primeiro'
            }
        },
        {
            names: ['cite book'],
            target: 'citar livro',
            dateFields: ['data'],
            params: {
                title: 'título',
                publisher: 'editora',
                year: 'ano',
                date: { to: 'data', mask: 'DD de MONTH de YYYY' },
                location: 'local',
                isbn: 'isbn',
                pages: 'páginas',
                page: 'página',
                author: 'autor',
                last: 'último',
                first: 'primeiro'
            }
        },
        {
            names: ['cite journal'],
            target: 'citar periódico',
            dateFields: ['data'],
            params: {
                title: 'título',
                journal: 'publicação',
                publisher: 'publicado',
                volume: 'volume',
                issue: 'número',
                pages: 'páginas',
                date: { to: 'data', mask: 'DD de MONTH de YYYY' },
                year: 'ano',
                doi: 'doi',
                author: 'autor',
                last: 'último',
                first: 'primeiro'
            }
        },
        { 
            names: ['cite conference', 'cite_conference'], 
            target: 'citar congresso', 
            dateFields: ['data', 'acessodata'], 
            params: { 
                title: 'título', 
                booktitle: 'título-livro', 
                conference: 'congresso', 
                date: { to: 'data', mask: 'DD de MONTH de YYYY' }, 
                year: 'ano', 
                publisher: 'editora', 
                location: 'local', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite interview', 'cite_interview'], 
            target: 'citar entrevista', 
            dateFields: ['data'], 
            params: { 
                subject: 'entrevistado', 
                title: 'título', 
                interviewer: 'entrevistador', 
                date: { to: 'data', mask: 'DD de MONTH de YYYY' }, 
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
            params: { 
                title: 'título', 
                date: { to: 'data', mask: 'DD de MONTH de YYYY' }, 
                degree: 'grau', 
                department: 'departamento', 
                university: 'universidade', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite document', 'cite_document'], 
            target: 'citar documento', 
            dateFields: ['data', 'acessodata'], 
            params: { 
                title: 'título', 
                date: { to: 'data', mask: 'DD de MONTH de YYYY' }, 
                type: 'tipo', 
                publisher: 'publicado', 
                institution: 'instituição', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' }, 
                author: 'autor', 
                last: 'último', 
                first: 'primeiro' 
            } 
        },
        { 
            names: ['cite encyclopedia', 'cite_encyclopedia'], 
            target: 'citar enciclopédia', 
            dateFields: ['data', 'acessodata'], 
            params: { 
                title: 'título', 
                encyclopedia: 'enciclopédia', 
                date: { to: 'data', mask: 'DD de MONTH de YYYY' }, 
                publisher: 'editora', 
                location: 'local', 
                volume: 'volume', 
                url: 'url', 
                accessdate: { to: 'acessodata', mask: 'DD de MONTH de YYYY' }, 
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
                birth_date: { to: 'nascimento_data', mask: 'DD de MONTH de YYYY' },
                birth_place: 'nascimento_local',
                death_date: { to: 'morte_data', mask: 'DD de MONTH de YYYY' },
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
                mask: 'DD de MONTH de YYYY'
            },
            birth_place: 'local_nascimento',
            death_date: {
                to: 'data_morte',
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
            },
            recorded: {
                to: 'gravação',
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                mask: 'DD de MONTH de YYYY'
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
                date: { to: 'período', mask: 'DD de MONTH de YYYY' },
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
