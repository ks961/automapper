# 🔄 AutoMapper Utility

AutoMapper is a lightweight TypeScript utility designed to automate the transformation of objects between DTOs and Entities. It provides an easy way to map data between classes, ensuring that your data transformation code is cleaner and more maintainable.

It also includes a JsonObject base class for easy conversion of class instances to/from JSON.


---

## 📦 Installation

Install via your preferred package manager:

### npm

```bash
npm install @d3vtool/automapper
```

### yarn

```bash
yarn add @d3vtool/automapper
```

---


## ✅ Testing

To run the tests:

```bash
npm run test
```

---

## ✨ Features

* Automatic mapping of fields between objects with matching names.
* Explicit mapping support for different field names using `forMember()`.
* Allows multiple mapping configurations (e.g., `User` to `UserDto` and `UserDto` to `User`).
* JSON serialization and deserialization using the `JsonObject` base class.

---

## 🧪 Examples

### 🔹 JsonObject Usage

#### 1. Convert JSON to Entity

```ts
import { JsonObject } from "@d3vtool/automapper";

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

const user = new User();
user.fromJson({
  id: "12",
  name: "Alice",
  email: "alice@mail.com",
  password: "secure123"
});

console.log(user.name); // "Alice"
```

#### 2. Convert Entity to JSON

```ts
const user = new User("12", "Alice", "alice@mail.com", "secure123");
const json = user.toJson();

console.log(json);
// { id: '12', name: 'Alice', email: 'alice@mail.com', password: 'secure123' }
```

---

### 🔹 AutoMapper Usage

#### 1. Create `autoMapper` instance

To create and reuse the AutoMapper instance:

```ts
import { AutoMapper } from "@d3vtool/automapper";

// Create one instance and reuse it across your application.
export const autoMapper = new AutoMapper();
```

#### 2. Map with Matching Field Names (One Direction)

```ts
import { autoMapper } from "./somefile";
import { JsonObject } from "@d3vtool/automapper";

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

class UserDto extends JsonObject<UserDto> {
  constructor(
    public id?: string,
    public name?: string,
    public email?: string
  ) {
    super();
  }
}

const userToDtoMapper = autoMapper.map(User, UserDto);

const user = new User("12", "Alice", "alice@mail.com", "secure123");
const userDto = userToDtoMapper.map(user);

console.log(userDto);
// Output: UserDto { id: '12', name: 'Alice', email: 'alice@mail.com' }
```

#### 3. Custom Mapping with Different Field Names

```ts
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

class UserDto extends JsonObject<UserDto> {
  constructor(
    public id?: string,
    public fullName?: string,
    public email?: string
  ) {
    super();
  }
}

const userToDtoMapper = autoMapper.map(User, UserDto);

// Custom mapping for `fullName` (combining `firstName` + `lastName`)
userToDtoMapper.forMember("fullName", (user) => `${user.firstName} ${user.lastName}`);

const user = new User("12", "Alice", "Smith", "alice@mail.com", "secure123");
const userDto = userToDtoMapper.map(user);

console.log(userDto);
// Output: UserDto { id: '12', fullName: 'Alice Smith', email: 'alice@mail.com' }
```

#### 4. Explicit Reverse Mapping (UserDto to User)

To map in the reverse direction, **you must explicitly create a new mapping**:

```ts
const dtoToUserMapper = autoMapper.map(UserDto, User);

// Assuming userDto is an instance of UserDto and fields are same of entity and dto.
const userFromDto = dtoToUserMapper.map(userDto);

// If fields aren't same then:
dtoToUserMapper
    .forMember("firstName", (dto) => dto.fullName?.split(" ")[0])
    .forMember("lastName", (dto) => dto.fullName?.split(" ")[1]);

const userFromDto = dtoToUserMapper.map(userDto);

console.log(userFromDto);
// Output: User { id: '12', firstName: 'Alice', lastName: 'Smith', email: 'alice@mail.com', password: 'secure123' }
```

---

This package is open-source and licensed under the [MIT License](LICENSE).