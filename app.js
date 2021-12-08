const { ApolloServer, gql } = require("apollo-server");
const { v1: uuid } = require("uuid");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e"
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e"
  }
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"]
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"]
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"]
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"]
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"]
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"]
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"]
  }
];

const typeDefs = gql`
  type Author {
    name: String!
    born: String
    id: ID!
    bookCount: Int
  }
  type Book {
    title: String
    published: String
    author: String
    genres: [String]
    id: ID
  }
  type Query {
    allAuthors: [Author!]!
    allBooks(author: String, genre: String): [Book]
    allBooksGenre(genre: String!): [Book]
    bookCount: [Author!]!
    authorCount: Int!
  }
  # type BookCount {
  #   name: String
  #   born: Int
  #   bookCount: Int
  # }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    addAuthor(name: String!): Author
    editAuthor(name: String!, setBornTo: Int): Author
  }
`;

const resolvers = {
  Query: {
    allAuthors: () => authors,
    allBooks: (root, args) => {
      if (args.genre && args.author) {
        return books.filter(
          (p) => p.author === args.author && p.genres.includes(args.genre)
        );
      } else if (args.author) {
        return books.filter((p) => p.author === args.author);
      } else if (args.genre) {
        return books.filter((p) => p.genres.includes(args.genre));
      } else {
        return books;
      }
    },
    allBooksGenre: (root, args) =>
      // books.filter((p) => p.genres.filter((item) => item === "john")),/
      books.filter((p) => p.genres.includes(args.genre)),
    bookCount: (root, args) => {
      // authors.map(({ bookCount, born, name }) => {
      //   authors.bookCount = books.filter((b) => b.author === name).length;
      //   return authors;
      // });
      // authors.map(({ name }) => {
      for (let item of authors) {
        item.bookCount = books.filter((b) => b.author === item.name).length;
      }
      return authors;
      // });
    },
    authorCount: () => authors.length
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() };
      books = books.concat(book);
      const findAuthor = authors.find((item) => item.name === args.author);
      if (!findAuthor) {
        authors = authors.concat({ name: args.author });
      }
      return book;
    },
    addAuthor: (root, args) => {
      const author = { ...args, id: uuid() };
      authors = authors.concat(author);
      return author;
    },
    editAuthor: (root, args) => {
      const author = authors.find((author) => author.name === args.name);
      if (!author) return null;
      author.born = args.setBornTo;
      return author;
    }
  }
  // BookCount: {
  //   countBooks: (root, args) => {
  //     let result = {};
  //     for (let item of books) {
  //       if (!results[item.author]) {
  //         results[item.author] = 1;
  //       } else {
  //         results[item.author]++;
  //       }
  //       return result;
  //     }
  //   }
  // }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(5000).then(() => {
  console.log(`Server ready at 5000`);
});
