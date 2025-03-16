
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface UserGreetingProps {
  onNameSave: (name: string) => void;
}

const UserGreeting = ({ onNameSave }: UserGreetingProps) => {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [showInput, setShowInput] = useState(false);
  
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setSavedName(storedName);
      setName(storedName);
    } else {
      setShowInput(true);
    }
  }, []);
  
  const saveName = () => {
    if (name.trim()) {
      localStorage.setItem("userName", name.trim());
      setSavedName(name.trim());
      setShowInput(false);
      onNameSave(name.trim());
    }
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  if (!showInput && savedName) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {getGreeting()}, {savedName}!
              </h2>
              <p className="text-muted-foreground mt-1">
                Track your habits and build better routines.
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowInput(true)}
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to Habit Tracker!</h2>
        <div className="space-y-4">
          <p>Please enter your name to get started:</p>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={(e) => e.key === "Enter" && saveName()}
            />
            <Button onClick={saveName}>Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGreeting;
