import { BaseRepo } from "../BaseRepo";
import { Account } from "../entity.ts/account";
import { DefaultDataSource, DefaultPGDataSource } from "../../util/orm";

export class AccountRepo extends BaseRepo<Account> {
  constructor() {
    super(DefaultPGDataSource.name, Account);
  }
}

export const AccountRepository = new AccountRepo();
