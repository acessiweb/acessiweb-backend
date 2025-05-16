export const REQUEST_TOKEN_PAYLOAD = 'REQUEST_TOKEN_PAYLOAD';
export const ROUTE_POLICY_KEY = 'ROUTE_POLICY_KEY';
export const PASSWORD_VALIDATION_MSG =
  'A senha precisa ter no mínimo 8 caracteres e no máximo 16 caracteres. Pelo menos uma letra maiúscula. Pelo menos um símbolo dentre os quais: @, #, *, ^, &, !, %. E pelo menos 2 caracteres numéricos';
export const PASSWORD_MASK =
  /^(?=.*[A-Z])(?=.*[@#*\^&!%])(?=.*\d.*\d)[A-Za-z\d@#*\^&!%]{8,16}$/;
