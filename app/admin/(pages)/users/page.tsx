import { getUsers } from "../../actions/posts";
import { UsersTable } from "../../tables/users-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage system users and permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
