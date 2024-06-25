Feature: Carrinho de Compras

  Background:
    Given o usuário com CPF "12312312301" está logado

  Scenario: Carrinho sem itens
    Given o carrinho do usuário de CPF "12312312301" está vazio
    When o usuário de CPF "12312312301" requisita a lista de itens do carrinho
    Then o usuário de CPF "12312312301" recebe um objeto com a lista de produtos vazia

  Scenario: Adicionar Produto ao Carrinho
    Given o produto “Tênis vermelho” é um dos Produtos registrados na tabela Produtos
    When o usuário de CPF "12312312301" adiciona "Tênis vermelho" ao carrinho
    Then o servidor retorna um status OK (200)
    And o usuário recebe um objeto com informações sobre a nova relação entre o produto e o carrinho

  Scenario: Remover Produto do Carrinho
    Given o produto “Tênis vermelho” está contido na lista de produtos do carrinho do usuário
    When o usuário remove o produto "Tênis vermelho" do carrinho
    Then o servidor retorna um status OK (200)
    And o usuário recebe um objeto com informações sobre a antiga relação entre o produto e o carrinho
    When O usuário requisita a lista de itens do carrinho novamente
    Then O item "Tênis vermelho" não estará mais na lista de produtos