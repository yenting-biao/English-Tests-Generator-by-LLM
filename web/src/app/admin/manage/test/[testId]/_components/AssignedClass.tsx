"use client";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { assignedTestsTableType } from "@/lib/types/db";
import AddClassForm from "./AddClassForm";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

type Props = {
  testId: string;
  classNameDict: { [key: number]: string };
  assignedClasses: assignedTestsTableType[];
};

let glbClassNameDict: { [key: number]: string };

export default function AssignedClass({
  testId,
  classNameDict,
  assignedClasses,
}: Props) {
  glbClassNameDict = classNameDict;
  const notAssignedClasses = Object.keys(classNameDict)
    .filter(
      (clsId) =>
        !assignedClasses.map((cls) => cls.classNumber).includes(Number(clsId))
    )
    .map(Number);
  const [disableEdit, setDisableEdit] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mt-4">
        {assignedClasses.length == 0 ? (
          <span className="text-lg">
            This test has not been assigned to any class.
          </span>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Show Answers</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedClasses.map((cls, index) => (
                <ClassRow
                  key={index}
                  cls={cls}
                  disableEdit={disableEdit}
                  setDisableEdit={setDisableEdit}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Separator className="my-4" />
      <h2 className="text-xl font-semibold mb-5 mx-1">
        Assign this test to other classes:
      </h2>
      <AddClassForm
        notAssignedClassNumber={notAssignedClasses}
        classNameDict={classNameDict}
        testId={testId}
      />
      <Toaster />
    </div>
  );
}

function ClassRow({
  cls,
  disableEdit,
  setDisableEdit,
}: {
  cls: assignedTestsTableType;
  disableEdit: boolean;
  setDisableEdit: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [showAnswers, setShowAnswers] = useState(cls.showAnswers);
  const [startDate, setStartDate] = useState(
    format(cls.startDate, "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(
    format(cls.endDate, "yyyy-MM-dd'T'HH:mm")
  );

  const handleEdit = async () => {
    if (!edit) {
      setEdit(true);
      setDisableEdit(true);
      setShowAnswers(cls.showAnswers);
      setStartDate(format(cls.startDate, "yyyy-MM-dd'T'HH:mm"));
      setEndDate(format(cls.endDate, "yyyy-MM-dd'T'HH:mm"));
    } else {
      const startTimeStamp = new Date(startDate).toISOString();
      const endTimeStamp = new Date(endDate).toISOString();
      if (startTimeStamp >= endTimeStamp) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Start time must be before the end time.",
          duration: 3000,
        });
        return;
      }

      const res = await fetch("/api/admin/tests/class", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: cls.testId,
          classNumber: cls.classNumber,
          showAnswer: showAnswers,
          startTimeStamp: startTimeStamp,
          endTimeStamp: endTimeStamp,
        }),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to update due to internal server error. Please try again later.",
        });
      } else {
        router.refresh();
        setEdit(false);
        setDisableEdit(false);
      }
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to remove this class from the test?"
      )
    ) {
      const res = await fetch("/api/admin/tests/class", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: cls.testId,
          classNumber: cls.classNumber,
        }),
      });
      if (!res.ok) {
        console.log("Failed to delete");
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to delete due to internal server error. Please try again later.",
          duration: 3000,
        });
      } else {
        router.refresh();
      }
    }
  };

  return (
    <TableRow className={edit ? "border-2 border-foreground" : ""}>
      <TableCell>{glbClassNameDict[cls.classNumber]}</TableCell>
      <TableCell>
        {edit ? (
          <Select
            defaultValue={cls.showAnswers ? "true" : "false"}
            onValueChange={(value) => {
              setShowAnswers(value === "true");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <>{cls.showAnswers ? "Yes" : "No"}</>
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <Input
            type="datetime-local"
            defaultValue={format(cls.startDate, "yyyy-MM-dd'T'hh:mm")}
            onChange={(e) => setStartDate(e.target.value)}
          />
        ) : (
          <>{format(cls.startDate, "yyyy/MM/dd hh:mm:ss a")}</>
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <Input
            type="datetime-local"
            defaultValue={format(cls.endDate, "yyyy-MM-dd'T'hh:mm")}
            onChange={(e) => setEndDate(e.target.value)}
          />
        ) : (
          <>{format(cls.endDate, "yyyy/MM/dd hh:mm:ss a")}</>
        )}
      </TableCell>
      <TableCell className="flex flex-col gap-5">
        <Button
          variant={edit ? "default" : "secondary"}
          onClick={handleEdit}
          disabled={disableEdit && !edit}
        >
          {edit ? "Save" : "Edit"}{" "}
        </Button>
        {edit && (
          <Button
            variant="outline"
            onClick={() => {
              setEdit(false);
              setDisableEdit(false);
            }}
          >
            Cancel
          </Button>
        )}
      </TableCell>
      <TableCell>
        <button
          className="text-destructive text-center mt-1"
          onClick={handleDelete}
        >
          <Trash2 size={20} />
        </button>
      </TableCell>
    </TableRow>
  );
}
