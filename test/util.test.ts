import { getCaptcha, replaceSensitiveInfo } from "../src/util/crypto";
import { CaptchaType, sensitive } from "../src/util/key";
describe("mask real information", () => {
  describe("replaceSensitiveInfo", () => {
    it("masks phone numbers", () => {
      expect(replaceSensitiveInfo("13812345678", sensitive.phone)).toBe(
        "138****5678"
      );
    });

    it("masks email addresses", () => {
      expect(replaceSensitiveInfo("auser@example.com", sensitive.email)).toBe(
        "a***@example.com"
      );
    });

    it("masks ID card numbers", () => {
      expect(replaceSensitiveInfo("123456199901011234", sensitive.idCard)).toBe(
        "1234****1234"
      );
    });

    it("masks bank card numbers", () => {
      expect(
        replaceSensitiveInfo("6222021234567890123", sensitive.bankCard)
      ).toBe("622202****0123");
    });

    it("masks single character name", () => {
      expect(replaceSensitiveInfo("李", sensitive.name)).toBe("李");
    });

    it("masks two-character name", () => {
      expect(replaceSensitiveInfo("李明", sensitive.name)).toBe("李*");
    });

    it("masks three-character name", () => {
      expect(replaceSensitiveInfo("李小明", sensitive.name)).toBe("李*明");
    });

    it("masks long name", () => {
      expect(replaceSensitiveInfo("李大大明", sensitive.name)).toBe("李**明");
    });

    it("returns unchanged string for unknown type", () => {
      expect(replaceSensitiveInfo("anything", "other" as sensitive)).toBe(
        "anything"
      );
    });
  });

  // describe("getCaptcha", () => {
  //   it("should return a Captcha object",  () => {
  //     const captcha =  getCaptcha(CaptchaType.NUMERIC, 4);
  //     expect(captcha).toHaveProperty("text");
  //     expect(captcha).toHaveProperty("base64");
  //     expect(captcha).toHaveProperty("id");
  //   });
  // });
});
