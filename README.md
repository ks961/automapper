# 🔄 AutoMapper Utility

AutoMapper is a lightweight TypeScript utility designed to automate the transformation of objects between DTOs and Entities. It provides an easy way to map data between classes, ensuring that your data transformation code is cleaner and more maintainable.

It also includes a JsonObject base class for easy conversion of class instances to/from JSON.

---

## Table of Contents

- [Installation](#-installation)
- [Features](#-features)
- [Examples](#-examples)
- [AutoMapper Usage](#-automapper-usage)
- [DTO Validation Decorators Usage](#dto-validation-decorators-usage)

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
* **DTO decorator-based validation** — enforce rules at instantiation time with built-in and custom validators.
* Built-in decorators:

  * `@Required()` – enforce presence of a value.
  * `@StringLength()` – set minimum/maximum string length.
  * `@Email()` – validate RFC-compliant email addresses.
  * `@Password()` – validate password strength.
  * `@Regex()` – validate values against a regular expression.
  * `@CustomFn()` – run custom validation logic.
* Automatic error handling via `ValidationFailedError` with `.field` and `.message` for failed validations.

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

### **DTO Validation Decorators Usage**

The `@DTO` decorator, in combination with field-level validation decorators, allows you to enforce rules at instantiation time.
If validation fails, **`ValidationFailedError`** is thrown with the invalid `field` and a descriptive `message`.

> **Note:** To use decorators in TypeScript, you must enable the experimental feature in your `tsconfig.json`:
>
> ```json
> {
>   "compilerOptions": {
>     "experimentalDecorators": true,
>     "emitDecoratorMetadata": true
>   }
> }
> ```

All decorators (except `StringLength`) accept an optional final parameter:

```ts
errorMsg?: string // Custom error message for this validation rule
```

---

#### **1. @Required()**

Marks a field as mandatory. Missing or empty values will cause validation to fail.

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @Required("Name is required")
    public name?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("Alice");

// ❌ Fails
try {
  new User();
} catch (err) {
  console.log(err instanceof ValidationFailedError); // true
  console.log(err.field); // "name"
  console.log(err.message); // "Name is required"
}
```

---

#### **2. @StringLength(minLength, maxLength?, errorMsg?: StringLengthParamError)**

Enforces string length limits.
You can provide different error messages for `minLength` and `maxLength` failures.

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @StringLength(5, 10, {
      minLength: "Name must be at least 5 characters",
      maxLength: "Name must be no more than 10 characters"
    })
    public name?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("Alice");

// ❌ Too short
try {
  new User("Al");
} catch (err) {
  console.log(err.field); // "name"
  console.log(err.message); // "Name must be at least 5 characters"
}

// ❌ Too long
try {
  new User("AlexandriaTheGreat");
} catch (err) {
  console.log(err.field); // "name"
  console.log(err.message); // "Name must be no more than 10 characters"
}
```

---

#### **3. @Email()**

Validates that the field contains a valid RFC-compliant email address.

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @Email("Invalid email address")
    public email?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("ok.user+tag@example.co.uk");

// ❌ Invalid
try {
  new User("invalid-email");
} catch (err) {
  console.log(err.field); // "email"
  console.log(err.message); // "Invalid email address"
}
```

---

#### **4. @Password()**

Validates password strength (implementation-dependent, e.g., min length, uppercase, number, symbol).

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @Password("Password is too weak")
    public password?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("Aa1!aaaa");

// ❌ Too weak
try {
  new User("123");
} catch (err) {
  console.log(err.field); // "password"
  console.log(err.message); // "Password is too weak"
}
```

---

#### **5. @Regex(pattern: RegExp, errorMsg?: string)**

Validates that the string matches a given pattern.
Example: Austrian phone numbers starting with `+43`.

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @Regex(/^\+43\s?(\d[\s-]?){4,14}$/, "Invalid Austrian phone number")
    public phone?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("+43 123-456-789");

// ❌ Invalid
try {
  new User("0043 123456");
} catch (err) {
  console.log(err.field); // "phone"
  console.log(err.message); // "Invalid Austrian phone number"
}
```

---

#### **6. @CustomFn(validatorFn: (value: unknown) => true | string, errorMsg?: string)**

Runs a custom validation function.
If it returns `true`, validation passes.
If it returns a string, that string is used as the error message.

```ts
@DTO
class User extends JsonObject<User> {
  constructor(
    @CustomFn((value) => {
      if (typeof value !== "string") return "Date must be a string";
      const parts = value.split("/");
      if (parts.length !== 3) return "Invalid date format";

      const [dd, mm, yyyy] = parts.map(Number);
      const daysInMonth = new Date(yyyy, mm, 0).getDate();

      if (yyyy < 1900 || yyyy > new Date().getFullYear()) return "Invalid year";
      if (mm < 1 || mm > 12) return "Invalid month";
      if (dd < 1 || dd > daysInMonth) return "Invalid day";

      return true;
    })
    public birthDate?: string
  ) {
    super();
  }
}

// ✅ Passes
new User("01/01/2000");

// ❌ Invalid
try {
  new User("32/01/2000");
} catch (err) {
  console.log(err.field); // "birthDate"
  console.log(err.message); // "Invalid day"
}
```

---

### **Error Types**

1. **`ValidationFailedError`**
   Thrown when a validation rule fails.
   Has:

   * `field`: the name of the invalid field
   * `message`: the error message
2. **Native `Error`**
   May be thrown by your own code inside a custom validator.

---

This package is open-source and licensed under the [MIT License](LICENSE).