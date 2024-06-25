export const MessagesHelper = {
  PASSWORD_OR_EMAIL_INVALID:
    'E-mail e/ou senha inválidos ou o usuário se encontra sem acesso ao sistema.',
  NOT_AUTHORIZED_RESOURCE: 'Usuário não autorizado a utilizar esse recurso!',
  USER_NOT_FOUND: 'Usuário X não encontrado!',
  USER_ALREADY_REGISTERED: 'Usuário já existe no sistema',
  FAIL_SENDING_EMAIL: 'Não foi possível enviar o email',
  USER_INACTIVE_TRYING_ACCESS:
    'Usuário inativo, procure o administrador do sistema',
  RECOVERY_PASSWORD_TOKEN_USED: 'Token de recuperação de senha já utilizado',
  INVALID_TOKEN: 'Token inválido',
  USER_ALREADY_ACTIVED: 'Usuário já está ativo',
  PASSWORD_UNMATCH: 'Senha não confere',
  PASSWORD_ARE_EQUALS: 'Nova senha deve ser diferente da atual',
  DATA_PAGINATION_ERROR: 'Erro ao paginar os dados',
  ID_REQUIRED: 'Id é obrigatório',
  EMAIL_ALREADY_EXISTS: 'Email já cadastrado no sistema',
  ACCESS_DENIED: 'Acesso negado',
  USER_ADMIN_DELETE: 'Usuário administrador não pode ser deletado',
  CART_ALREADY_EXISTS: 'Carrinho já existe para este usuário',
  CATEGORY_ALREADY_EXISTS: 'Categoria já existe no sistema',
  CATEGORY_NOT_FOUND: 'Categoria X não encontrado!',
};

export enum MessagesHelperKey {
  PASSWORD_OR_EMAIL_INVALID = 'PASSWORD_OR_EMAIL_INVALID',
  NOT_AUTHORIZED_RESOURCE = 'NOT_AUTHORIZED_RESOURCE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  FAIL_SENDING_EMAIL = 'FAIL_SENDING_EMAIL',
  USER_INACTIVE_TRYING_ACCESS = 'USER_INACTIVE_TRYING_ACCESS',
  RECOVERY_PASSWORD_TOKEN_USED = 'RECOVERY_PASSWORD_TOKEN_USED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  USER_ALREADY_ACTIVED = 'USER_ALREADY_ACTIVED',
  PASSWORD_UNMATCH = 'PASSWORD_UNMATCH',
  PASSWORD_ARE_EQUALS = 'PASSWORD_ARE_EQUALS',
  DATA_PAGINATION_ERROR = 'DATA_PAGINATION_ERROR',
  ID_REQUIRED = 'ID_REQUIRED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USER_UPDATE_YOURSELF = 'USER_UPDATE_YOURSELF',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_ADMIN_DELETE = 'USER_ADMIN_DELETE',
  USER_DELETE_YOURSELF = 'USER_DELETE_YOURSELF',
  USERS_NOT_FOUND = 'USERS_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  CART_ALREADY_EXISTS = 'CART_ALREADY_EXISTS',
  CATEGORY_ALREADY_EXISTS = 'CATEGORY_ALREADY_EXISTS',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
}

export const getMessage = (key: MessagesHelperKey): string => {
  return MessagesHelper[key];
};

export const setMessage = (
  message: string,
  replace: any,
  reason?: string,
): string => {
  return (
    message?.replace('X', JSON.stringify(replace)) +
    (reason ? ` - description: ${reason}` : '')
  );
};
