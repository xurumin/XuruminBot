"use strict";
const Utils = require("./../utils/utils");
const crypto = require("crypto");

module.exports = {
    /**
     * @param  {String} payerId
     * @param  {String} payeeId
     * @param  {Number} value
     */
    pay(payerId, payeeId, value){
        return new Promise(async (resolve, reject)=>{
            const transaction = {
                status: "pending",
                create_time: (new Date()),
                id: crypto.createHash("sha256").update(crypto.randomBytes(64)).digest("hex"),
                payerId: payerId,
                payeeId: payeeId,
                value: Number(parseFloat(value).toFixed(2))
            }
            if(isNaN(transaction.value) || transaction.value <= 0){
                return reject({ 
                    code: 1,
                    message: "Invalid value"
                })
            }
            var payerInfo;
            var payeeInfo;
            try {
                payerInfo = await Utils.Profile.getProfile({}, transaction.payerId)
                payeeInfo = await Utils.Profile.getProfile({}, transaction.payeeId)

                if(!payeeInfo.money)payeeInfo.money=0;
            } catch (error) {
                transaction.status="error"
                reject(error)
            }

            try {

                await Utils.Profile.setTag({}, transaction.payerId,"money",parseFloat(payerInfo.money)-transaction.value)
                await Utils.Profile.setTag({}, transaction.payeeId,"money",parseFloat(payeeInfo.money)+transaction.value)
                
                transaction.status="ok"
                resolve(transaction)
            } catch (error) {
                transaction.status="error"
                reject(error)
            }
        })
    },
    async userHasFunds(userId, value){
        const userProfile = await Utils.Profile.getProfile({},userId)
        if(userProfile.money && userProfile.money > value){
            return true
        }else{
            return false
        }
    },
    getUserFund(userId){
        return new Promise(async (resolve, reject)=>{
            const userProfile = await Utils.Profile.getProfile({},userId)
            if(userProfile.money){
                return resolve(userProfile)
            }else{
                return reject({message: "User do not have funds"})
            }
        })
    }
}