import { useState, type ReactNode } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function DecisionDialog({trigger,title,description,confirmLabel="Confirm",destructive=false,reasonRequired=false,busy=false,onConfirm}:{trigger:ReactNode;title:string;description:string;confirmLabel?:string;destructive?:boolean;reasonRequired?:boolean;busy?:boolean;onConfirm:(reason:string)=>Promise<void>}){
 const [reason,setReason]=useState("");const [open,setOpen]=useState(false);
 async function confirm(e:React.MouseEvent){if(reasonRequired&&!reason.trim()){e.preventDefault();return;}e.preventDefault();await onConfirm(reason.trim());setOpen(false);setReason("");}
 return <AlertDialog open={open} onOpenChange={setOpen}><AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><div className="space-y-2"><Label htmlFor="decision-reason">Reason {reasonRequired?"(required)":"(optional)"}</Label><Textarea id="decision-reason" value={reason} onChange={(e)=>setReason(e.target.value)} maxLength={400} placeholder="Add a clear audit note"/></div><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirm} disabled={busy||reasonRequired&&!reason.trim()} className={cn(destructive&&"bg-destructive text-destructive-foreground hover:bg-destructive/90")}>{busy?"Processing…":confirmLabel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
