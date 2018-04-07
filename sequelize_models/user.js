module.exports = (sequelize, DataTypes) => {
	return sequelize.define("user", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [8, 200]
			}
		},
		email: DataTypes.STRING,
		avatar: DataTypes.STRING,
		token: DataTypes.STRING,
		admin: DataTypes.BOOLEAN
	});
};