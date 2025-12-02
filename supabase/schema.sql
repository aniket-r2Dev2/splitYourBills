-- Users Table (extends Supabase auth)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- Drop existing policies if present (helps re-running this script safely)
drop policy if exists "Users can read their own profile" on users;
drop policy if exists "Users can update their own profile" on users;
drop policy if exists "Users can see their groups" on groups;
drop policy if exists "Group creator can update" on groups;
drop policy if exists "Group creator can delete" on groups;
drop policy if exists "Users can create groups" on groups;
drop policy if exists "Users can see group members" on group_members;
drop policy if exists "Group creator can add members" on group_members;
drop policy if exists "Users can see group expenses" on expenses;
drop policy if exists "Expense payer can update" on expenses;
drop policy if exists "Expense payer can delete" on expenses;
drop policy if exists "Users can create expenses" on expenses;
drop policy if exists "Users can see expense splits" on splits;
drop policy if exists "Expense payer can create splits" on splits;
drop policy if exists "Users can see group settlements" on settlements;

-- RLS Policy: Users can read their own profile
create policy "Users can read their own profile"
  on users for select
  using (auth.uid() = id);

-- RLS Policy: Users can update their own profile
create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id);

-- Groups Table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table groups enable row level security;

-- Group Members Table (create before RLS policies that reference it)
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamp default now(),
  unique(group_id, user_id)
);

alter table group_members enable row level security;

-- RLS Policy: Users can see groups they're members of
create policy "Users can see their groups"
  on groups for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

-- RLS Policy: Group creator can update/delete
create policy "Group creator can update"
  on groups for update
  using (auth.uid() = created_by);

create policy "Group creator can delete"
  on groups for delete
  using (auth.uid() = created_by);

-- RLS Policy: Users can create groups (must set created_by to their auth uid)
create policy "Users can create groups"
  on groups for insert
  with check (auth.uid() = created_by);

-- RLS Policy: Users can see members of groups they're in
create policy "Users can see group members"
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

-- RLS Policy: Group creator can add members
create policy "Group creator can add members"
  on group_members for insert
  with check (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.created_by = auth.uid()
    )
  );

-- Expenses Table
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  description text not null,
  amount decimal(10, 2) not null,
  paid_by uuid not null references users(id) on delete cascade,
  date date not null,
  category text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table expenses enable row level security;

-- RLS Policy: Users can see expenses in groups they're members of
create policy "Users can see group expenses"
  on expenses for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = expenses.group_id
      and group_members.user_id = auth.uid()
    )
  );

-- RLS Policy: Expense payer can update/delete
create policy "Expense payer can update"
  on expenses for update
  using (auth.uid() = paid_by);

create policy "Expense payer can delete"
  on expenses for delete
  using (auth.uid() = paid_by);

-- RLS Policy: Users can create expenses if they are the payer
create policy "Users can create expenses"
  on expenses for insert
  with check (
    auth.uid() = paid_by
  );

-- Splits Table (tracks who owes what on an expense)
create table if not exists splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  amount decimal(10, 2) not null,
  created_at timestamp default now(),
  unique(expense_id, user_id)
);

alter table splits enable row level security;

-- RLS Policy: Users can see splits for expenses they're members of
create policy "Users can see expense splits"
  on splits for select
  using (
    exists (
      select 1 from expenses
      join group_members on group_members.group_id = expenses.group_id
      where expenses.id = splits.expense_id
      and group_members.user_id = auth.uid()
    )
  );

-- RLS Policy: Expense payer can create splits for an expense
create policy "Expense payer can create splits"
  on splits for insert
  with check (
    exists (
      select 1 from expenses
      where expenses.id = splits.expense_id
      and expenses.paid_by = auth.uid()
    )
  );

-- Settlements Table (tracks payments between users)
create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id uuid not null references users(id) on delete cascade,
  amount decimal(10, 2) not null,
  settled_at timestamp default now(),
  notes text,
  created_at timestamp default now()
);

alter table settlements enable row level security;

-- RLS Policy: Users can see settlements in groups they're members of
create policy "Users can see group settlements"
  on settlements for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = settlements.group_id
      and group_members.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index if not exists idx_group_members_user on group_members(user_id);
create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_expenses_group on expenses(group_id);
create index if not exists idx_expenses_payer on expenses(paid_by);
create index if not exists idx_splits_expense on splits(expense_id);
create index if not exists idx_splits_user on splits(user_id);
create index if not exists idx_settlements_group on settlements(group_id);
create index if not exists idx_settlements_users on settlements(from_user_id, to_user_id);

-- Trigger to update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if present to allow re-running this script
drop trigger if exists update_users_updated_at on users;
drop trigger if exists update_groups_updated_at on groups;
drop trigger if exists update_expenses_updated_at on expenses;

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

create trigger update_groups_updated_at
  before update on groups
  for each row
  execute function update_updated_at_column();

create trigger update_expenses_updated_at
  before update on expenses
  for each row
  execute function update_updated_at_column();
