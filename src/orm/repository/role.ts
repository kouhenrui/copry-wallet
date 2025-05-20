import { BaseRepo } from "../BaseRepo";
import { Role } from "../entity.ts/role";
import { DefaultDataSource, DefaultPGDataSource } from "../../util/orm";

class RoleRepo extends BaseRepo<Role> {
  constructor() {
    super(DefaultPGDataSource.name, Role);
  }
}
const RoleRepository = new RoleRepo();
export { RoleRepository };
