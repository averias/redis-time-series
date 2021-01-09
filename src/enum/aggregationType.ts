/**
 * The type of aggregation to be executed
 *
 * Types:
 *
 * AVG, SUM, MIN, MAX, RANGE, COUNT, FIRST, LAST, STD_P, STD_S, VAR_P, VAR_S
 */
export enum AggregationType {
    AVG = "avg",
    SUM = "sum",
    MIN = "min",
    MAX = "max",
    RANGE = "range",
    COUNT = "count",
    FIRST = "first",
    LAST = "last",
    STD_P = "std.p",
    STD_S = "std.s",
    VAR_P = "var.p",
    VAR_S = "var.s"
}
