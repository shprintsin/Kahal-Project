"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import { formatDateHe } from "@/app/admin/utils/date";

import { User } from "@prisma/client";
import { ConfiguredTable, TableColumn } from "@/app/admin/components/tables/configured-table";
import { codeCell, rightActions } from "@/app/admin/components/tables/table-utils";

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const columns: TableColumn<User>[] = [
    {
      id: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name || user.email}</span>
        </div>
      ),
    },
    { id: "email", header: "Email", render: (user) => codeCell(user.email) },
    { id: "created", header: "Created", render: (user) => formatDateHe(user.createdAt) },
    {
      id: "actions",
      header: <span className="text-right block">Actions</span>,
      render: () => rightActions(
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      ),
      align: "right",
    },
  ];

  return <ConfiguredTable data={users} columns={columns} rowKey={(u) => u.id} />;
}
