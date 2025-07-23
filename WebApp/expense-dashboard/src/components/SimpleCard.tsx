import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SimpleCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardDescription>Total expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <h2>4,550.32€</h2>
        <p>+12.5% from last month</p>
      </CardContent>
     
    </Card>
  );
}
