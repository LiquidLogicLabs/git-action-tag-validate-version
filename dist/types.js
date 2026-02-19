"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionType = void 0;
/**
 * Supported version format types
 */
var VersionType;
(function (VersionType) {
    VersionType["AUTO"] = "auto";
    VersionType["SEMVER"] = "semver";
    VersionType["SIMPLE"] = "simple";
    VersionType["DOCKER"] = "docker";
    VersionType["CALVER"] = "calver";
    VersionType["DATE_BASED"] = "date-based";
    VersionType["REGEX"] = "regex";
})(VersionType || (exports.VersionType = VersionType = {}));
//# sourceMappingURL=types.js.map