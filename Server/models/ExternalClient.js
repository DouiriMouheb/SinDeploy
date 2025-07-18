// models/ExternalClient.js - Track external clients and their sync status
module.exports = (sequelize, DataTypes) => {
  const ExternalClient = sequelize.define(
    "ExternalClient",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      externalOrganizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "external_organizations",
          key: "id",
        },
        field: "external_organization_id",
      },
      externalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "external_id",
        comment: "External API client ID",
      },
      localCustomerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "customers",
          key: "id",
        },
        field: "local_customer_id",
        comment: "Reference to local customer if created",
      },
      // Store original external data
      externalData: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: "external_data",
        comment: "Original external API response data",
      },
      // Transformed fields for easy access
      ragsoc: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Company name from external API",
      },
      codContabile: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "cod_contabile",
        comment: "Accounting code from external API",
      },
      piva: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "VAT number from external API",
      },
      indirizzo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Address from external API",
      },
      cap: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Postal code from external API",
      },
      comune: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "City from external API",
      },
      provincia: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "Province from external API",
      },
      tel: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Phone from external API",
      },
      emailIstituzionale: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "email_istituzionale",
        comment: "Institutional email from external API",
      },
      emailAmministrativa: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "email_amministrativa",
        comment: "Administrative email from external API",
      },
      flgCliente: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "flg_cliente",
        comment: "Is client flag from external API",
      },
      flgFornitore: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "flg_fornitore",
        comment: "Is supplier flag from external API",
      },
      flgProspect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "flg_prospect",
        comment: "Is prospect flag from external API",
      },
      lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "last_sync_at",
      },
      syncStatus: {
        type: DataTypes.STRING(20),
        defaultValue: "synced",
        allowNull: false,
        field: "sync_status",
      },
    },
    {
      tableName: "external_clients",
    }
  );

  ExternalClient.associate = function (models) {
    // Belongs to external organization
    ExternalClient.belongsTo(models.ExternalOrganization, {
      foreignKey: "external_organization_id",
      targetKey: "id",
      as: "externalOrganization",
    });

    // Reference to local customer
    ExternalClient.belongsTo(models.Customer, {
      foreignKey: "local_customer_id",
      targetKey: "id",
      as: "localCustomer",
    });
  };

  return ExternalClient;
};
