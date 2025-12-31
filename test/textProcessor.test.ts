import { assert } from "chai";
import { removeSpaces, hasRemovableSpaces } from "../src/utils/textProcessor";

describe("textProcessor", function () {
  describe("removeSpaces", function () {
    it("should remove spaces between Japanese characters", function () {
      assert.equal(removeSpaces("これ は 日本語 です"), "これは日本語です");
    });

    it("should preserve spaces between Japanese and English", function () {
      assert.equal(removeSpaces("Hello 世界 です"), "Hello 世界です");
    });

    it("should normalize double spaces at JA-EN boundary", function () {
      assert.equal(removeSpaces("Hello  世界"), "Hello 世界");
    });

    it("should normalize double spaces at EN-JA boundary", function () {
      assert.equal(removeSpaces("世界  Hello"), "世界 Hello");
    });

    it("should handle mixed double spaces and JA-JA spaces", function () {
      assert.equal(removeSpaces("Hello  世界 です"), "Hello 世界です");
    });

    it("should preserve spaces between numbers and Japanese", function () {
      assert.equal(removeSpaces("2024 年 1 月"), "2024 年 1 月");
    });

    it("should collapse multiple spaces to single space", function () {
      assert.equal(removeSpaces("a    b"), "a b");
    });

    it("should preserve single spaces in non-Japanese text", function () {
      assert.equal(removeSpaces("a b c"), "a b c");
    });
  });

  describe("hasRemovableSpaces", function () {
    it("should return true for JA-JA spaces", function () {
      assert.isTrue(hasRemovableSpaces("これ は"));
    });

    it("should return true for double spaces", function () {
      assert.isTrue(hasRemovableSpaces("Hello  世界"));
    });

    it("should return true for double spaces at JA-EN boundary", function () {
      assert.isTrue(hasRemovableSpaces("世界  Hello"));
    });

    it("should return false for single space at boundary only", function () {
      assert.isFalse(hasRemovableSpaces("Hello 世界"));
    });

    it("should return false for text without spaces", function () {
      assert.isFalse(hasRemovableSpaces("これは日本語"));
    });
  });
});
