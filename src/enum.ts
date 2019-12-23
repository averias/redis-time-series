enum CommandEnum {
    CREATE = "TS.CREATE",
    ALTER = "TS.ALTER",
    ADD = "TS.ADD",
    MADD = "TS.MADD",
    INCRBY = "TS.INCRBY",
    DECRBY = "TS.DECRBY",
    CREATE_RULE = "TS.CREATERULE",
    DELETE_RULE = "TS.DELETERULE",
    RANGE = "TS.RANGE",
    MULTI_RANGE = "TS.MRANGE",
    GET = "TS.GET",
    MULTI_GET = "TS.MGET",
    INFO = "TS.INFO",
    QUERY_INDEX = "TS.QUERYINDEX"
}

enum CommandKeyword {
    LABELS = "LABELS",
    RETENTION = "RETENTION",
    AGGREGATION = "AGGREGATION",
    TIMESTAMP = "TIMESTAMP",
    MIN_TIMESTAMP = "-",
    MAX_TIMESTAMP = "+",
    CURRENT_TIMESTAMP = "*",
    COUNT = "COUNT",
    FILTER = "FILTER"
}

enum AggregationType {
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

enum FilterOperator {
    EQUAL = "=",
    NOT_EQUAL = "!="
}

export { CommandEnum, CommandKeyword, AggregationType, FilterOperator };
