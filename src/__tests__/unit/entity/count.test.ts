import { Count } from "../../../entity/count";
import { CommandKeyword } from "../../../enum/commandKeyword";

test("count creation with valid integer number", () => {
    const count = new Count(5);
    const flatten = count.flatten();
    expect(flatten).toContain(CommandKeyword.COUNT);
    expect(flatten).toContain(5);
    expect(flatten.length).toBe(2);
});

test("count creation with valid float number", () => {
    const count = new Count(1.56);
    const flatten = count.flatten();
    expect(flatten).toContain(CommandKeyword.COUNT);
    expect(flatten).toContain(1);
    expect(flatten.length).toBe(2);
});

test("count creation throws error with integer number", () => {
    expect(() => {
        new Count(-1);
    }).toThrow("count must be positive, provided -1");
});

test("count creation throws error with float number", () => {
    expect(() => {
        new Count(-1.17);
    }).toThrow("count must be positive, provided -1");
});
