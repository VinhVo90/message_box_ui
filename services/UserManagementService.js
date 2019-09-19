const models = require('../models');
const Sequelize = require('sequelize-oracle');
const {CRUD_FLAG} = require('../configs/constants');

const getUsers = async (ctx) => {
  const { userId, userType } = ctx.request.body.params;

  let query = `
  SELECT '${CRUD_FLAG.RETRIEVE}' AS "FLAG", U.SYSTEM_ID, U.USER_ID, U.PASSWORD, U.ACCESS_CONTROL AS USER_TYPE, TO_CHAR(HIS.REC_TIME, 'DD MON YYYY, HH12:MI AM') AS "UPDATED"
  FROM USER_ACCOUNTS U,
    (SELECT SYSTEM_ID, REC_TIME
    FROM (SELECT SYSTEM_ID, MAX(REC_TIME) AS REC_TIME FROM  USER_ACCOUNT_HISTORY
    GROUP BY SYSTEM_ID)) HIS
  WHERE 1=1
  AND HIS.SYSTEM_ID = U.SYSTEM_ID \n`;

  if (userId !== '') {
    query += `
    AND UPPER(USER_ID) LIKE '%${userId.toUpperCase()}%' \n`;
  }
  if (userType !== '') {
    query += `
    AND UPPER(ACCESS_CONTROL) LIKE '%${userType.toUpperCase()}%'`;
  }

  query += `
    ORDER BY U.SYSTEM_ID DESC`;
 
  await models.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT
  }).then(result => {
    ctx.body = result;
  });
}

const getUserHistory = async (ctx) => {
  const { systemId } = ctx.request.body.params;

  const query = `
    SELECT SYSTEM_ID, USER_ID, TO_CHAR(REC_TIME, 'DD MON YYYY, HH12:MI AM') AS REC_TIME
    FROM USER_ACCOUNT_HISTORY HIS
    WHERE SYSTEM_ID = '${systemId}'
    ORDER BY HIS.REC_TIME DESC
  `;
 
  await models.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT
  }).then(result => {
    ctx.body = result;
  });
}

const saveUsers = async (ctx) => {
  const { data } = ctx.request.body.params;
  
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].FLAG === CRUD_FLAG.CREATE) {
      // create
      await createUser(data[i]);
    } else if (data[i].FLAG === CRUD_FLAG.UPDATE) {
      // update
      await updateUser(data[i]);
    } else if (data[i].FLAG === CRUD_FLAG.DELETE) {
      // delete
      await deleteUser(data[i]);
    }
  }

  ctx.body = 'OK';  
}

const createUser = async (user) => {
  const query = `
  BEGIN
    PROC_CREATE_USER(:userId,:userType,:passWord);
  END;`;

  await models.sequelize.query(query, {
    replacements: {
      userId: user.USER_ID,
      userType: user.USER_TYPE,
      passWord: user.PASSWORD,
    }
  }).then(result => {
    
  });
}

const updateUser = async (user) => {
  const query = `
  BEGIN
    PROC_UPDATE_USER(:systemId, :userId, :userType, :passWord);
  END;`;

  await models.sequelize.query(query, {
    replacements: {
      systemId: user.SYSTEM_ID,
      userId: user.USER_ID,
      userType: user.USER_TYPE,
      passWord: user.PASSWORD
    }
  }).then(result => {
    
  });
}

const deleteUser = async (user) => {
  const query = `
  BEGIN
    PROC_DELETE_USER(:systemId);
  END;`;

  await models.sequelize.query(query, {
    replacements: {
      systemId: user.SYSTEM_ID
    }
  }).then(result => {
    
  });
}

const getGroups = async (ctx) => {
  const { systemId } = ctx.request.body.params;

  const query = `
    SELECT '${CRUD_FLAG.RETRIEVE}' AS "FLAG", SYSTEM_ID, GROUP_ID
    FROM USER_MESSAGE_GROUPS
    WHERE SYSTEM_ID = :systemId
  `;
 
  await models.sequelize.query(query, {
    replacements: {
      systemId: systemId
    }, 
    type: Sequelize.QueryTypes.SELECT
  }).then(result => {
    ctx.body = result;
  });
}

const saveGroups = async (ctx) => {
  const { data, systemId } = ctx.request.body.params;
  
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].FLAG === CRUD_FLAG.CREATE) {
      // create
      await createGroup(data[i], systemId);
    } else if (data[i].FLAG === CRUD_FLAG.DELETE) {
      // delete
      await deleteGroup(data[i], systemId);
    }
  }

  ctx.body = 'OK';  
}

const createGroup = async (group, systemId) => {
  const query = `
  INSERT INTO USER_MESSAGE_GROUPS(SYSTEM_ID, GROUP_ID)
  VALUES(:systemId, :groupId)`;

  await models.sequelize.query(query, {
    replacements: {
      systemId: systemId,
      groupId: group.GROUP_ID
    },
    type: Sequelize.QueryTypes.INSERT
  }).then(result => {
    
  });
}

const deleteGroup = async (group, systemId) => {
  const query = `
  DELETE FROM USER_MESSAGE_GROUPS
  WHERE SYSTEM_ID = :systemId
    AND GROUP_ID = :groupId`;

  await models.sequelize.query(query, {
    replacements: {
      systemId: systemId,
      groupId: group.GROUP_ID
    },
    type: Sequelize.QueryTypes.DELETE
  }).then(result => {
    
  });
}



module.exports = {
  getUsers,
  saveUsers,
  getGroups,
  saveGroups,
  getUserHistory
}