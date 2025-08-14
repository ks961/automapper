import { describe, expect, it } from "vitest";
import { AutoMapper, Mapper, JsonObject } from "../src/index";

// entity
class User extends JsonObject<User> {
    constructor(
        public id?: string,
        public name?: string,
        public email?: string,
        public password?: string
    ) {
        super();
    }
}

// dto
class UserDto extends JsonObject<UserDto> {
    constructor(
        public id?: string,
        public name?: string,
        public email?: string
    ) {
        super();
    }
}

describe("JsonObject", () => {
    
    it("should populate entity properties from JSON data when 'fromJson' is called", () => {

        const user = new User();
        const obj = {
            id: "12",
            name: "name2",
            email: "mail",
            password: "password"
        };

        user.fromJson(obj);

        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("password");

        expect(user["id"]).toBe(obj["id"]);
        expect(user["name"]).toBe(obj["name"]);
        expect(user["email"]).toBe(obj["email"]);
        expect(user["password"]).toBe(obj["password"]);
    });

    it("should generate a JSON object when toJson is called", () => {

        const user = new User(
            "12",
            "name2",
            "mail",
            "password"
        );

        const obj = user.toJson();

        expect(obj).toBeInstanceOf(Object);

        expect(obj).toHaveProperty("id");
        expect(obj).toHaveProperty("name");
        expect(obj).toHaveProperty("email");
        expect(obj).toHaveProperty("password");

        expect(obj["id"]).toBe(user["id"]);
        expect(obj["name"]).toBe(user["name"]);
        expect(obj["email"]).toBe(user["email"]);
        expect(obj["password"]).toBe(user["password"]);
    });
});

const autoMapper = new AutoMapper();
describe("AutoMapper", () => {
    it("should map object value when field name are same of entity and dto", () => {
        const fromUsertoDto = autoMapper.map(User, UserDto);

        expect(fromUsertoDto).toBeInstanceOf(Mapper);

        const user = new User(
            "12",
            "name2",
            "mail",
            "password"
        );

        const userDto = fromUsertoDto.map(user);
        
        expect(userDto).toBeInstanceOf(UserDto);
        expect(userDto).toHaveProperty("id");
        expect(userDto).toHaveProperty("name");
        expect(userDto).toHaveProperty("email");
        expect(userDto).not.toHaveProperty("password");
        
        expect(userDto["id"]).toBe(user["id"]);
        expect(userDto["name"]).toBe(user["name"]);
        expect(userDto["email"]).toBe(user["email"]);
    });

    it("should map object value when field name aren't same of entity and dto", () => {
       
        // entity
        class User extends JsonObject<User> {
            constructor(
                public id?: string,
                public firstName?: string,
                public lastName?: string,
                public email?: string,
                public password?: string
            ) {
                super();
            }
        }

        // dto
        class UserDto extends JsonObject<UserDto> {
            constructor(
                public id?: string,
                public fullName?: string,
                public email?: string
            ) {
                super();
            }
        }

        
        const fromUsertoDto = autoMapper.map(User, UserDto);

        expect(fromUsertoDto).toBeInstanceOf(Mapper);

        const user = new User(
            "12",
            "fname",
            "lname",
            "mail",
            "password"
        );

        fromUsertoDto.forMember(
            "fullName",
            (user) => `${user.firstName} ${user.lastName}`
        )

        const userDto = fromUsertoDto.map(user);
        
        expect(userDto).toBeInstanceOf(UserDto);
        expect(userDto).toHaveProperty("id");
        expect(userDto).toHaveProperty("fullName");
        expect(userDto).toHaveProperty("email");
        expect(userDto).not.toHaveProperty("password");
        
        expect(userDto["id"]).toBe(user["id"]);
        expect(userDto["email"]).toBe(user["email"]);
        expect(userDto["fullName"]).toBe(`${user.firstName} ${user.lastName}`);
    });
});