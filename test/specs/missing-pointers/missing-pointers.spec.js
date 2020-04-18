"use strict";

const chai = require("chai");
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
const { expect } = chai;
const $RefParser = require("../../../lib");
const { JSONParserErrorGroup, MissingPointerError } = require("../../../lib/util/errors");
const helper = require("../../utils/helper");
const path = require("../../utils/path");

describe("Schema with missing pointers", () => {
  it("should throw an error for missing pointer", async () => {
    try {
      await $RefParser.dereference({ foo: { $ref: "#/baz" }});
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(MissingPointerError);
      expect(err.message).to.contain("Token \"baz\" does not exist.");
    }
  });

  it("should throw a grouped error for missing pointer if failFast is false", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference({ foo: { $ref: "#/baz" }}, { failFast: false });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).to.be.instanceof(JSONParserErrorGroup);
      expect(err.files).to.equal(parser);
      expect(err.files.$refs._root$Ref.value).to.deep.equal({ foo: null });
      expect(err.message).to.have.string("1 error occurred while reading '");
      expect(err.errors).to.containSubset([
        {
          name: MissingPointerError.name,
          message: "Token \"baz\" does not exist.",
          path: ["foo"],
          source: expectedValue => expectedValue.endsWith("/test/") || expectedValue.startsWith("http://localhost"),
        }
      ]);
    }
  });
});
