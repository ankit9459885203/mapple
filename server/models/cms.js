// content management sysytem

module.exports = (sequelize, DataTypes) => {
  const CMS = sequelize.define(
    "CMS",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      slug: {
        //  about-us ,  terms and conditions , privacy policy , contact us
        // this is how it will look - GET /api/cms/:slug   
        // instead of getbyTittle using slug  to get , because its human readable , 
        // tittle can be of bigger size which may include  spaces or special  characters  that is not supported by url.

        type: DataTypes.STRING,
        unique: true,
      },

      title: {
        // "About Us"   look , in slug we also mentioning  about-us  . toh diffrence ye hai ki slug me hum url k liye daalte or title me user k lliye  daalte
        type: DataTypes.STRING,
      },

      content: {
        type: DataTypes.TEXT("long"), //  long  , medium , tiny .  this is the size of the text we can select , not using in other dataytypes coz they have fixed predefined size.
      },

      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "cms_pages",
      paranoid: true,
    },
  );

  return CMS;
};
