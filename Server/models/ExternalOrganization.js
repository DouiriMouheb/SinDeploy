// models/ExternalOrganization.js - Track external organizations and sync status
module.exports = (sequelize, DataTypes) => {
  const ExternalOrganization = sequelize.define(
    "ExternalOrganization",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      externalCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "external_code",
      },
      externalName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: "external_name",
      },
      localOrganizationId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "local_organization_id",
      },
      lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_sync_at",
      },
      syncStatus: {
        type: DataTypes.STRING(20),
        defaultValue: "pending",
        allowNull: false,
        field: "sync_status",
      },
      syncError: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "sync_error",
      },
      clientsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: "clients_count",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: "is_active",
      },
    },
    {
      tableName: "external_organizations",
    }
  );

  ExternalOrganization.associate = function (models) {
    // Reference to local organization
    ExternalOrganization.belongsTo(models.Organization, {
      foreignKey: "local_organization_id",
      targetKey: "id",
      as: "localOrganization",
    });

    // Track synced clients
    ExternalOrganization.hasMany(models.ExternalClient, {
      foreignKey: "external_organization_id",
      sourceKey: "id",
      as: "syncedClients",
    });
  };

  return ExternalOrganization;
};
