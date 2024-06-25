Feature: Cart Service

Scenario: Listar carrinho
	Given O usuário de ID "1" está logado
	When O usuário consulta seu carrinho
	Then O usuário recebe a lista de produtos em seu carrinho

Scenario: Adicionar produto ao carrinho
	Given O usuário de ID "1" está logado
	And Existe um produto de ID "1"
	And O usuário possui um carrinho de ID "1"
	When O usuário tenta adicionar o produto ao seu carrinho
	Then Deve ser recebido um objeto com informações da relação entre o produto e o carrinho

Scenario: Remover produto do carrinho
	Given O usuário de ID "1" está logado
	And Existe um produto de ID "1"
	And O usuário possui um carrinho de ID "1"
	And O usuário possui o produto especificado em seu carrinho
	When O usuário tenta remover o produto ao seu carrinho
	Then A relação deve ser excluída e deve ser recebido um objeto com informações da antiga relação entre o produto e o carrinho

Scenario: Atualizar quantidade de produto no carrinho
	Given O usuário de ID "1" está logado
	And Existe um produto de ID "1"
	And O usuário possui um carrinho de ID "1"
	And O usuário possui "1" unidades do produto especificado em seu carrinho
	When O usuário tenta aumentar em 1 a quantidade de unidades do produto em seu carrinho
	Then Deve ser recebido um objeto com as novas informações definidas da relação entre o produto e o carrinho
