module.exports.dockerConfigValidator = req => {
	if (!req.body.dockerConfig) return "no-config";
	else if (isNaN(req.body.dockerConfig)) return "NaN";
	else if (![0, 1, 2].includes(parseInt(req.body.dockerConfig)))
		return "no-valid-config";
	else return "ok";
};
module.exports.codeValidator = req => (req.body.code ? true : false);
