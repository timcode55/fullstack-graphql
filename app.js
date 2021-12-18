const { ApolloServer, UserInputError, gql } = require("apollo-server");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const { v1: uuid } = require("uuid");
const book = require("./models/book");
const author = require("./models/author");

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

console.log("connecting to", process.env.DATABASE);

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = gql`
  type Author {
    name: String!
    born: String
    id: ID!
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
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
    createBook(
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
    allAuthors: async () => await Author.find({}),
    allBooks: async (root, args) => {
      if (args.genre && args.author) {
        return books.filter(
          (p) => p.author === args.author && p.genres.includes(args.genre)
        );
      } else if (args.author) {
        // return books.filter((p) => p.author === args.author);
        return await Book.find({ author: { $in: [args.author] } });
      } else if (args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } });
      } else {
        return await book.find({});
      }
    },
    allBooksGenre: async (root, args) =>
      // books.filter((p) => p.genres.includes(args.genre)),
      {
        return await Book.find({ genres: { $in: [args.genre] } });
      },
    bookCount: async (root, args) => {
      const allAuthors = await Author.find({});
      const allBooks = await Book.find({});
      for (let item of allAuthors) {
        console.log(item, "ITEM");
        // item.bookCount = books.filter((b) => b.author === item.name).length;
        await Author.findOneAndUpdate(
          // { name: item.name },
          {
            $set: {
              // bookCount: allBooks.filter((b) => b.author === item.name).length
              bookCount: 2
            }
          },
          { new: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              console.log("Updated");
            }
          }
        )
          .clone()
          .catch(function (err) {
            console.log(err);
          });
        if (!author) return null;
        // author.born = args.setBornTo;
        // return updateBook;
        // item.bookCount = allBooks.filter((b) => b.author === item.name).length;
      }
      return allAuthors;
    },
    authorCount: async () => await author.find({}).count()
  },
  Mutation: {
    createBook: async (root, args) => {
      const book = new Book({ ...args });
      try {
        await book.save();
      } catch (error) {
        throw error;
      }
      // books = books.concat(book);
      // const findAuthor = authors.find((item) => item.name === args.author);
      // if (!findAuthor) {
      //   authors = authors.concat({ name: args.author });
      // }
      return book;
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args, id: uuid() });
      try {
        await author.save();
      } catch (error) {
        throw error;
      }
      return author;
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { $set: { born: args.setBornTo } },
        { new: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            console.log("Updated");
          }
        }
      )
        .clone()
        .catch(function (err) {
          console.log(err);
        });
      if (!author) return null;
      // author.born = args.setBornTo;
      return author;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(5000).then(() => {
  console.log(`Server ready at 5000`);
});
