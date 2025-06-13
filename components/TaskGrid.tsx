"use client";

import { supabase } from "@/lib/supabase-client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Input } from "./ui/input";
import { Edit } from "lucide-react";

const TaskGrid = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime:tasks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          console.log("New task:", payload.new);
          setTasks((prev) => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log("Channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    // Update state after delete
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-4 w-full">
      {tasks.map((task) => {
        console.log(task);
        return (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={task.image_url ?? ""}
                alt="task"
                width={100}
                height={100}
              />
              <UpdateInput initialTitle={task.title} email={task.email} />
            </CardContent>
            <CardFooter>
              <Button onClick={() => deleteTask(task.id)}>Delete</Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskGrid;

const UpdateInput = ({
  initialTitle,
  email,
}: {
  initialTitle: string;
  email: string;
}) => {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [isPending, startTransition] = useTransition();
  const update = () => {
    startTransition(async () => {
      await supabase
        .from("tasks")
        .update({
          title,
        })
        .eq("email", email);
    });
  };
  return (
    <div className="flex gap-1 py-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Button size={"icon"} onClick={() => update()} disabled={isPending}>
        <Edit />
      </Button>
    </div>
  );
};
