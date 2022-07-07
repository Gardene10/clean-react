
import { HttpPostClientSpy } from "../../test"
import { RemoteAuthentication } from "./remote-authentication"
import { mockAccountModel, mockAuthentication } from "../../../test"
import { InvalidCredentialsError, UnexpectedError } from "../../../erros"
import { HttpStatusCode } from "../../protocols/http"
import { AuthenticationParams } from "../../../usecases"
import { AccountModel } from "../../../models"
import faker from 'faker'

type sutTypes = {

    sut: RemoteAuthentication
    httpPostClientSpy: HttpPostClientSpy<AuthenticationParams,AccountModel>
}

const makeSut = (url: string = faker.internet.url()): sutTypes => {
   
        const httpPostClientSpy = new HttpPostClientSpy<AuthenticationParams,AccountModel>()
        const sut = new RemoteAuthentication(url,httpPostClientSpy)
        return {
            sut,
            httpPostClientSpy
        }
}


describe('RemoteAuthentication', () => {

    test('Should call HttpPostClient with correct URL', async () =>{
        

        const url = faker.internet.url()
        const {sut,httpPostClientSpy} = makeSut(url)
        await sut.auth(mockAuthentication())
        expect (httpPostClientSpy.url).toBe(url)
    })

    test('Should call HttpPostClient with correct body', async () => {
        const {sut,httpPostClientSpy} = makeSut()
        const authenticationParams = mockAuthentication()
        await sut.auth(authenticationParams)
        expect (httpPostClientSpy.body).toEqual(authenticationParams)
    })

    test('Should throw InvalidCredentialsError if HttpPostClient return 401', async () => {
        const {sut,httpPostClientSpy} = makeSut()
        httpPostClientSpy.response = {
            statusCode: HttpStatusCode.unauthorized
        }
        const promise = sut.auth(mockAuthentication())
        await expect (promise).rejects.toThrow (new InvalidCredentialsError())
        
    })

    test('Should throw unexpectedError if HttpPostClient return 400', async () => {
        const {sut,httpPostClientSpy} = makeSut()
        httpPostClientSpy.response = {
            statusCode: HttpStatusCode.badRequest
        }
        const promise = sut.auth(mockAuthentication())
        await expect (promise).rejects.toThrow (new UnexpectedError())
        
    })



    test('Should throw unexpectedError if HttpPostClient return 500', async () => {
        const {sut,httpPostClientSpy} = makeSut()
        httpPostClientSpy.response = {
            statusCode: HttpStatusCode.severError
        }
        const promise = sut.auth(mockAuthentication())
        await expect (promise).rejects.toThrow (new UnexpectedError())
        
    })
    test('Should throw unexpectedError if HttpPostClient return 404', async () => {
        const {sut,httpPostClientSpy} = makeSut()
        httpPostClientSpy.response = {
            statusCode: HttpStatusCode.notFound
        }
        const promise = sut.auth(mockAuthentication())
        await expect (promise).rejects.toThrow (new UnexpectedError())
        
    })


})
test('Should return an AccountModel if HttpPostClient return 200', async () => {
    const {sut,httpPostClientSpy} = makeSut()
    const httpResult = mockAccountModel()
    httpPostClientSpy.response = {
        statusCode: HttpStatusCode.ok,
        body: httpResult 
    }
    const account = await sut.auth(mockAuthentication())
    expect(account).toEqual(httpResult)
    
})
