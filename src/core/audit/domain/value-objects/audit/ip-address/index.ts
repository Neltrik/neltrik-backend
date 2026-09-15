import ipaddr from "ipaddr.js";

import { InvalidIpAddressError } from "../../../errors";

export class IpAddress {
    private constructor(private readonly ipAddress: string) {}

    public static create(value: string): IpAddress {
        const normalizedValue = value.trim();
        this.ensureIsNotEmpty(normalizedValue);
        this.ensureIsValid(normalizedValue);
        const address = ipaddr.parse(normalizedValue);
        return new IpAddress(address.toNormalizedString());
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new InvalidIpAddressError();
        }
    }

    private static ensureIsValid(value: string): void {
        if (!ipaddr.isValid(value)) {
            throw new InvalidIpAddressError();
        }
    }

    public get value(): string {
        return this.ipAddress;
    }

    public equals(other: IpAddress): boolean {
        return this.ipAddress === other.ipAddress;
    }
}
