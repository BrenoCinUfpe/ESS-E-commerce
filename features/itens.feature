Feature: Criação e manutenção de itens no menu

    Scenario: Inclusão de item ao banco de dados com todos os campos obrigatórios 
        Given um serviço de administração de itens está disponível
        And o serviço de inclusão de itens requer os campos nome, descrição, preço e imagem
        And não existe um item com nome “itemX” previamente cadastrado
        When um usuário administrador tenta adicionar um novo item com nome "itemX", descrição "abcdef" e imagem "www.abcde.com"
        Then o item "itemX" deve ser cadastrado com os dados registrados
        And a resposta deve conter a mensagem "Item successfully created"

    Scenario: Atualização de item previamente existente do banco de dados 
        Given um serviço de administração de itens está disponível
        And o serviço de atualização de itens permite a atualização dos campos opcionais: nome, descrição, preço e imagem
        When um usuário administrador tenta atualizar o item com ID 1001, definindo o preço como “4.00”
        Then o preço do item com ID 1001 deve ser atualizado para "4.00"
        And a resposta deve conter a mensagem "Item successfully updated"

    Scenario: Remoção de item previamente existente do banco de dados 
        Given um serviço de administração de itens está disponível
        When um usuário administrador tenta remover o item com ID "1002"
        And o item com ID "1002" está cadastrado
        Then o item de ID "1002" deve ser excluido
        And a resposta deve conter a mensagem "Item successfully deleted"

    Scenario: Erro de Validação de Campos Obrigatórios ao Adicionar Item
        Given um serviço de administração de itens está disponível
        And o serviço de inclusão de itens requer os campos nome, descrição, preço e imagem
        When um usuário administrador tenta adicionar um novo item sem fornecer todos os campos obrigatórios
        Then nenhum item é adicionado
        And a resposta deve conter a mensagem "Validation error: Campos obrigatórios não fornecidos"

    Scenario: Erro de Item Já Existente ao Adicionar
        Given um serviço de administração de itens está disponível
        And o serviço de inclusão de itens requer os campos nome, descrição, preço e imagem
        And já existe um item com nome "itemX" previamente cadastrado
        When um usuário administrador tenta adicionar um novo item com nome "itemX", descrição "abcdef", preço "4.00" e imagem "www.abcde.com"
        Then o item não será adicionado
        And a resposta deve conter a mensagem "Item already exists"
    
    Scenario: Erro de Validação de Tipo de Dado ao Atualizar
        Given um serviço de administração de itens está disponível
        And o serviço de atualização de itens permite a atualização dos campos opcionais: nome, descrição, preço e imagem
        When um usuário administrador tenta atualizar o item com ID 1001, utilizando um valor inválido para o campo preço (por exemplo, "R$4,00" ao invés de "4.00")
        Then o item não é atualizado
        And a resposta deve conter a mensagem "Validation error: Tipo de dado inválido para o campo preço"

    Scenario: Erro de Item Não Encontrado ao Atualizar
        Given um serviço de administração de itens está disponível
        And o serviço de atualização de itens permite a atualização dos campos opcionais: nome, descrição, preço e imagem
        When um usuário administrador tenta atualizar o item com ID 9999 (ID inválido), definindo o preço como "4.00"
        Then o item não é atualizado
        And a resposta deve conter a mensagem "Item not found"
    
    Scenario: Erro de ID Faltando ao Deletar Item
        Given um serviço de administração de itens está disponível
        When um usuário administrador tenta remover um item sem fornecer o ID do item a ser deletado
        Then nenhum item é removido 
        And a resposta deve conter a mensagem "Validation error: ID do item não fornecido"
    
    Scenario: Erro de Item Não Encontrado ao Deletar
        Given um serviço de administração de itens está disponível
        When um usuário administrador tenta remover o item com ID "9999" (ID inválido)
        Then nenhum item é removido
        And a resposta deve conter a mensagem "Item not found"

    Scenario: Erro de Atualização de Item Inexistente no Banco de Dados
        Given um serviço de administração de itens está disponível
        And o serviço de administração de itens permite a atualização dos campos opcionais: nome, descrição, preço e imagem
        When um usuário administrador tenta atualizar o item com ID 2001, definindo o preço como "5.00"
        And o item com ID 2001 não está previamente cadastrado
        Then nenhum item é atualizado
        And a resposta deve conter a mensagem "Item not found"