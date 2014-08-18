module.exports = function (req, res, next) {
   const msg = 'Você não tem permissão para executar essa ação!';

   return req.user.permissions.admin.value? next(): res.forbidden(msg);
};
