# hateaos

A library to facilitate Hypermedia as the Engine of Application State in Node.

```typescript
import hateoas from "hateoas";

interface User {
  id: string;
}

const routing = hateoas({ baseUrl: "http://localhost:3000" })
  .registerLinkHandler("root", () => ({ self: "/", users: "/users" }))
  .registerLinkHandler("user", (user: User) => {
    self: `/users/${user.id}`,
    ...(isAdmin() ? { delete: `/users/${user.id}` } : {})
  })
  .registerCollectionLinkHandler("users", (users: User[]) => ({
    self: "/users",
    ...(isAdmin() ? { create: "/users" } : {})
  }));

routing.link("user", { id: 123 });
/*
{
  id: 123,
  links: {
    self: "http://localhost:3000/users/123",
    delete: "http://localhost:3000/users/123"
  }
}
*/

routing.link("users", [{ id: 123 }]);
/*
{
  data: [
    {
      id: 123,
      links: {
        self: "http://localhost:3000/users/123",
        delete: "http://localhost:3000/users/123"
      }
    }
  ],
  links: {
    self: "http://localhost:3000/users",
    create: "http://localhost:3000/users"
  }
}
*/
```
