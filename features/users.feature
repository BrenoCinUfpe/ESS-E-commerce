Feature: User Service

  Scenario: Criar um novo usuário com sucesso
    Given que não existe um usuário com o email "cliente@gmail.com"
    And o dado de criação do usuário contém o nome "cliente cadastro", o email "cliente@gmail.com" e a senha "Senha@1238"
    When o serviço de autenticação registra o usuário
    Then o usuário deve ser criado com nome "cliente cadastro" e email "cliente@gmail.com"
    And o status do usuário deve ser "ACTIVE"
    And o repositório de usuários deve verificar a existência de um usuário com o email "cliente@gmail.com"
    And o repositório de usuários deve criar o usuário com nome "cliente cadastro", email "cliente@gmail.com" e status "ACTIVE"

  Scenario: Tentar registrar um usuário com um email já utilizado
    Given que já existe um usuário com o email "cliente123@gmail.com"
    And o dado de criação do usuário contém o nome "cliente cadastro", o email "cliente@gmail.com" e a senha "Senha@1238"
    When o serviço de autenticação tenta registrar o usuário
    Then deve lançar uma ConflictException

  Scenario: Definir o status do usuário como "Inativo"
    Given existe um usuário com o ID 1 e email "cliente123@gmail.com" com status "ACTIVE"
    And o ID do usuário a ser deletado é 1
    When o serviço de usuário deleta o usuário
    Then o repositório de usuários deve encontrar o usuário pelo ID 1
    And o repositório de usuários deve verificar a existência do usuário com ID 1
    And o repositório de usuários deve deletar o usuário com ID 1

  Scenario: Tentar deletar um usuário já inativo
    Given existe um usuário com o ID 1 e email "cliente123@gmail.com" com status "INACTIVE"
    And o ID do usuário a ser deletado é 1
    When o serviço de usuário tenta deletar o usuário
    Then deve lançar uma ForbiddenException

  Scenario: Tentar deletar um usuário que não existe
    Given o ID do usuário a ser deletado é 1
    And o usuário com ID 1 não existe
    When o serviço de usuário tenta deletar o usuário
    Then deve lançar uma NotFoundException

  Scenario: Atualizar os dados de registro do usuário logado
    Given existe um usuário logado com ID 1 e email "cliente123@gmail.com"
    And o nome atualizado do usuário é "cliente atualizado"
    And o dado de atualização dos dados pessoais contém "cliente atualizado"
    When o serviço de usuário atualiza os dados pessoais do usuário logado
    Then o repositório de usuários deve encontrar o usuário pelo ID 1
    And o repositório de usuários deve atualizar o usuário com nome "cliente atualizado"

  Scenario: Não atualizar se nenhum dado for fornecido
    Given existe um usuário logado com ID 1 e email "cliente123@gmail.com"
    And o dado de atualização dos dados pessoais está vazio
    When o serviço de usuário tenta atualizar os dados pessoais do usuário logado
    Then o repositório de usuários não deve ser chamado para encontrar o usuário
    And o repositório de usuários não deve ser chamado para atualizar o usuário

  Scenario: Lançar erro se o usuário não for encontrado
    Given o ID do usuário logado é 1
    And o nome atualizado do usuário é "cliente normal"
    And o dado de atualização dos dados pessoais contém "cliente normal"
    And o usuário com ID 1 não existe
    When o serviço de usuário tenta atualizar os dados pessoais do usuário logado
    Then deve lançar uma NotFoundException

  Scenario: Lançar erro se o usuário estiver inativo ou deletado
    Given o ID do usuário logado é 1
    And o nome atualizado do usuário é "cliente normal"
    And o dado de atualização dos dados pessoais contém "cliente normal"
    And o usuário com ID 1 está inativo ou deletado
    When o serviço de usuário tenta atualizar os dados pessoais do usuário logado
    Then deve lançar uma ForbiddenException

  Scenario: Atualizar a senha do usuário logado
    Given existe um usuário logado com ID 1 e email "cliente123@gmail.com"
    And a senha atual é "Senha@123"
    And a nova senha é "Senha@8858"
    And o dado de atualização de senha contém "Senha@123" e "Senha@8858"
    When o serviço de usuário atualiza a senha do usuário logado
    Then o repositório de usuários deve encontrar o usuário pelo ID 1
    And o repositório de usuários deve atualizar a senha do usuário

  Scenario: Lançar erro se a senha atual for a mesma que a nova senha
    Given existe um usuário logado com ID 1 e email "cliente123@gmail.com"
    And a senha atual e a nova senha são "Senha@123"
    And o dado de atualização de senha contém "Senha@123" e "Senha@123"
    When o serviço de usuário tenta atualizar a senha do usuário logado
    Then deve lançar uma BadRequestException

  Scenario: Lançar erro se a senha atual estiver incorreta
    Given existe um usuário logado com ID 1 e email "cliente123@gmail.com"
    And a senha atual é "Senha@123"
    And a senha incorreta é "SenhaErrada@123"
    And a nova senha é "Senha@8858"
    And o dado de atualização de senha contém "SenhaErrada@123" e "Senha@8858"
    When o serviço de usuário tenta atualizar a senha do usuário logado
    Then deve lançar uma BadRequestException

  Scenario: Deletar o usuário
    Given existe um usuário com ID 1 e email "cliente123@gmail.com" com status "ACTIVE"
    And o ID do usuário a ser deletado é 1
    When o serviço de usuário deleta o usuário
    Then o repositório de usuários deve deletar o usuário com ID 1

  Scenario: Lançar BadRequestException se o ID for nulo
    When o serviço de usuário tenta deletar um usuário com ID nulo
    Then deve lançar uma BadRequestException

  Scenario: Lançar NotFoundException se o usuário não existir
    Given o ID do usuário a ser deletado é 1
    And o usuário com ID 1 não existe
    When o serviço de usuário tenta deletar o usuário
    Then deve lançar uma NotFoundException

  Scenario: Lançar ForbiddenException se o usuário já estiver inativo
    Given existe um usuário com ID 1 e email "cliente123@gmail.com" com status "INACTIVE"
    And o ID do usuário a ser deletado é 1
    When o serviço de usuário tenta deletar o usuário
    Then deve lançar uma ForbiddenException

  Scenario: Lançar ForbiddenException se o usuário for um administrador
    Given existe um usuário com ID 1 e email "admin@gmail.com" com status "ACTIVE" e papel "ADMIN"
    And o ID do usuário a ser deletado é 1
    When o serviço de usuário tenta deletar o usuário
    Then deve lançar uma ForbiddenException

  Scenario: Validar usuário com sucesso
    Given que o usuário inseriu no campo email o valor "email@gmail.com"
    And o usuário inseriu no campo senha o valor "teste"
    And existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste"
    When tenta logar no sistema
    Then o usuário deve receber o próprio usuário validado com o email

  Scenario: Lançar UnauthorizedException se o usuário não for encontrado
    Given que o usuário inseriu no campo email o valor "email@gmail.com"
    And o usuário inseriu no campo senha o valor "teste"
    And não existe um usuário no sistema com o email "email@gmail.com"
    When fazer login no sistema
    Then deve lançar uma UnauthorizedException

  Scenario: Lançar UnauthorizedException se o usuário estiver inativo
    Given que o usuário inseriu no campo email o valor "email@gmail.com"
    And o usuário inseriu no campo senha o valor "teste"
    And existe um usuário inativo no sistema com o email "email@gmail.com" e com a senha "teste"
    When tenta fazer login no sistema
    Then deve lançar uma UnauthorizedException

  Scenario: Lançar UnauthorizedException se a senha for inválida
    Given que o usuário inseriu no campo email o valor "email@gmail.com"
    And o usuário inseriu no campo senha o valor "teste@123"
    And não existe um usuário no sistema com o email "email@gmail.com"
    When clica em “Fazer login no sistema”
    Then deve lançar uma UnauthorizedException

  Scenario: Login com sucesso
    Given que o usuário inseriu no campo email o valor "email@gmail.com"
    And o usuário inseriu no campo senha o valor "teste"
    And existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste"
    When clica em “Fazer login no sistema”
    Then o usuário deve ser redirecionado para a página inicial da aplicação autenticado
    And deve receber a token de acesso na resposta da requisição
    And deve receber a token de refresh na resposta da requisição

  Scenario: Solicitar recuperação de senha
    Given que o usuário inseriu o valor "email@gmail.com" no campo de email
    And no sistema existe um usuário com o campo email com o valor "email@gmail.com"
    When usuário solicita a recuperação de senha
    Then O usuário deve receber um email com um link para recuperação de senha

  Scenario: Trocar a senha com a token de recuperação válida
    Given que o usuário tem uma token de recuperação com o valor "192x7x8asjdjas89d8"
    And o sistema tem a token de recuperação com o valor "192x7x8asjdjas89d8" atrelado ao email "email@gmail.com"
    And o usuário enviou na senha o valor "Senha@8858"
    When o usuário clica em “Trocar senha”
    Then a senha do usuário atrelado a token de recuperação é modificada

  Scenario: O usuário solicita a lista de pedidos
    Given que existe um usuário com o ID "1" e email "cliente123@gmail.com" com status "ACTIVE"
    When o usuário solicita a lista de pedidos
    Then o sistema deve retornar sua lista de pedidos

  Scenario: O administrador solicita a lista de pedidos de outro usuário
    Given que existe um administrador no sistema
    And que existe um usuário com o ID "1" e email "cliente123@gmail.com" com status "ACTIVE"
    When o administrador solicita a lista de pedidos desse usuário
    Then o sistema deve retornar a lista de pedidos do usuário
