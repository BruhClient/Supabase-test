"use client";

import { TaskPayload, TaskSchema } from "@/schemas/task";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase-client";
import { Session } from "@supabase/supabase-js";

const TaskForm = ({ session }: { session: Session }) => {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const form = useForm<TaskPayload>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const onSubmit = async (values: TaskPayload) => {
    startTransition(async () => {
      const { error } = await supabase
        .from("tasks")
        .insert({ ...values, email: session.user.email })
        .select()
        .single();
      if (error) {
        return;
      }

      form.reset();
    });
  };
  return (
    <div className="space-y-3 max-w-[500px] w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">Title</FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      className="py-5 placeholder:font-semibold px-4"
                      placeholder="Title"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">
                  Description
                </FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      className="py-5 placeholder:font-semibold px-4"
                      placeholder="Description"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <Button disabled={isPending} className="w-full">
            Submit
          </Button>
        </form>
      </Form>

      <Button
        onClick={() => {
          logout();
        }}
        className="w-full"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default TaskForm;
