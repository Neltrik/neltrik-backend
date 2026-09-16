import { InvalidIpAddressError } from "../../../errors";
import { IpAddress } from "./index";

describe("IpAddress", () => {
    it("should create a valid IPv4 address", () => {
        const ipAddress = IpAddress.create("192.168.1.1");
        expect(ipAddress.value).toBe("192.168.1.1");
    });

    it("should create a valid IPv6 address", () => {
        const ipAddress = IpAddress.create("2001:db8::1");
        expect(ipAddress.value).toBe("2001:db8:0:0:0:0:0:1");
    });

    it("should trim whitespace from the IP address", () => {
        const ipAddress = IpAddress.create(" 192.168.1.1 ");
        expect(ipAddress.value).toBe("192.168.1.1");
    });

    it("should normalize an IPv4-mapped IPv6 address", () => {
        const ipAddress = IpAddress.create("::ffff:192.168.1.1");
        expect(ipAddress.value).toBe("0:0:0:0:0:ffff:c0a8:101");
    });

    it("should normalize an IPv6 address", () => {
        const ipAddress = IpAddress.create("2001:0DB8:0000:0000:0000:0000:0000:0001");
        expect(ipAddress.value).toBe("2001:db8:0:0:0:0:0:1");
    });

    it("should throw InvalidIpAddressError when IP address is empty", () => {
        expect(() => IpAddress.create("")).toThrow(InvalidIpAddressError);
    });

    it("should throw InvalidIpAddressError when IP address contains only whitespace", () => {
        expect(() => IpAddress.create("   ")).toThrow(InvalidIpAddressError);
    });

    it("should throw InvalidIpAddressError when IPv4 address is invalid", () => {
        expect(() => IpAddress.create("192.168.1.999")).toThrow(InvalidIpAddressError);
    });

    it("should throw InvalidIpAddressError when IPv4 address has an invalid format", () => {
        expect(() => IpAddress.create("192.168.1.1.1")).toThrow(InvalidIpAddressError);
    });

    it("should throw InvalidIpAddressError when IP address is not valid", () => {
        expect(() => IpAddress.create("not-an-ip-address")).toThrow(InvalidIpAddressError);
    });

    it("should throw TypeError when IP address is null", () => {
        expect(() => IpAddress.create(null as unknown as string)).toThrow(TypeError);
    });

    it("should throw TypeError when IP address is undefined", () => {
        expect(() => IpAddress.create(undefined as unknown as string)).toThrow(TypeError);
    });

    it("should return the IP address value", () => {
        const ipAddress = IpAddress.create("192.168.1.1");
        expect(ipAddress.value).toBe("192.168.1.1");
    });

    it("should return true when IP addresses are equal", () => {
        const firstIpAddress = IpAddress.create("192.168.1.1");
        const secondIpAddress = IpAddress.create("192.168.1.1");
        expect(firstIpAddress.equals(secondIpAddress)).toBe(true);
    });

    it("should return false when IP addresses are different", () => {
        const firstIpAddress = IpAddress.create("192.168.1.1");
        const secondIpAddress = IpAddress.create("192.168.1.2");
        expect(firstIpAddress.equals(secondIpAddress)).toBe(false);
    });

    it("should return true when equivalent IPv6 addresses are compared", () => {
        const firstIpAddress = IpAddress.create("2001:db8::1");
        const secondIpAddress = IpAddress.create("2001:0db8:0:0:0:0:0:1");
        expect(firstIpAddress.equals(secondIpAddress)).toBe(true);
    });

    it("should return true when equivalent IPv4-mapped IPv6 addresses are compared", () => {
        const firstIpAddress = IpAddress.create("::ffff:192.168.1.1");
        const secondIpAddress = IpAddress.create("::ffff:c0a8:101");
        expect(firstIpAddress.equals(secondIpAddress)).toBe(true);
    });

    it("should return true when the IP address is IPv4", () => {
        const ipAddress = IpAddress.create("192.168.1.1");
        expect(ipAddress.isIPv4()).toBe(true);
    });

    it("should return false when the IPv6 address is checked as IPv4", () => {
        const ipAddress = IpAddress.create("2001:db8::1");
        expect(ipAddress.isIPv4()).toBe(false);
    });

    it("should return true when the IP address is IPv6", () => {
        const ipAddress = IpAddress.create("2001:db8::1");
        expect(ipAddress.isIPv6()).toBe(true);
    });

    it("should return false when the IPv4 address is checked as IPv6", () => {
        const ipAddress = IpAddress.create("192.168.1.1");
        expect(ipAddress.isIPv6()).toBe(false);
    });
});
