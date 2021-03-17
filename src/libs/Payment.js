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

                if(!payerInfo){
                    var standard_profile = Utils.Profile.getStandardProfile()
                    await Utils.Profile.setProfile({}, transaction.payerId,standard_profile.bg_url,standard_profile.aboutme, standard_profile.level, standard_profile.points)

                    payerInfo = await Utils.Profile.getProfile({}, transaction.payerId)
                }
                if(!payeeInfo){
                    var standard_profile = Utils.Profile.getStandardProfile()
                    await Utils.Profile.setProfile({}, transaction.payeeId,standard_profile.bg_url,standard_profile.aboutme, standard_profile.level, standard_profile.points)

                    payeeInfo = await Utils.Profile.getProfile({}, transaction.payeeId)
                }

                if(!payeeInfo.money) payeeInfo.money=0;
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
    fastPay(payerId, value){
        var mc = this
        return new Promise(async (resolve, reject)=>{
            const transaction = {
                status: "pending",
                create_time: (new Date()),
                id: crypto.createHash("sha256").update(crypto.randomBytes(64)).digest("hex"),
                payerId: payerId,
                value: Number(parseFloat(value).toFixed(2))
            }
            if(isNaN(transaction.value) || transaction.value <= 0){
                return reject({ 
                    code: 1,
                    message: "Invalid value"
                })
            }
            if(!(await mc.userHasFunds(payerId,value))){
                return reject({
                    status: 100,
                    message: "user do not have money"
                })
            }
            var payerInfo;
            try {
                payerInfo = await Utils.Profile.getProfile({}, transaction.payerId)

                if(!payerInfo){
                    var standard_profile = Utils.Profile.getStandardProfile()
                    await Utils.Profile.setProfile({}, transaction.payerId,standard_profile.bg_url,standard_profile.aboutme, standard_profile.level, standard_profile.points)

                    payerInfo = await Utils.Profile.getProfile({}, transaction.payerId)
                }

            } catch (error) {
                transaction.status="error"
                reject(error)
            }
            try {
                await Utils.Profile.setTag({}, transaction.payerId,"money",parseFloat(payerInfo.money)-transaction.value)   
                transaction.status="ok"
                resolve(transaction)
            } catch (error) {
                transaction.status="error"
                reject(error)
            }
        })
    },
    fastPayXurumin(payeeId, value){
        var mc = this
        return new Promise(async (resolve, reject)=>{
            const transaction = {
                status: "pending",
                create_time: (new Date()),
                id: crypto.createHash("sha256").update(crypto.randomBytes(64)).digest("hex"),
                payeeId: payeeId,
                payerId: "system",
                value: Number(parseFloat(value).toFixed(2))
            }
            if(isNaN(transaction.value) || transaction.value <= 0){
                return reject({ 
                    code: 1,
                    message: "Invalid value"
                })
            }
            var payeeInfo;
            try {
                payeeInfo = await Utils.Profile.getProfile({}, transaction.payeeId)

                if(!payeeInfo){
                    var standard_profile = Utils.Profile.getStandardProfile()
                    await Utils.Profile.setProfile({}, transaction.payeeId,standard_profile.bg_url,standard_profile.aboutme, standard_profile.level, standard_profile.points)

                    payeeInfo = await Utils.Profile.getProfile({}, transaction.payeeId)
                }
            } catch (error) {
                transaction.status="error"
                reject(error)
            }
            try {
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