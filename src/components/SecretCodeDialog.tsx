import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface SecretCodeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	secretCode: (string | null)[];
	currentTurn: number;
}

export function SecretCodeDialog({
	open,
	onOpenChange,
	secretCode,
	currentTurn,
}: SecretCodeDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Code Maker's Secret Code</DialogTitle>
					<DialogDescription>
						Turn {currentTurn + 1} - The code to break
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex justify-center gap-4 p-2 md:p-6 bg-gray-100 rounded-lg">
						{secretCode.map((color, index) => (
							<div key={index} className="flex flex-col items-center gap-2">
								<div
									className="w-10 h-10 md:w-16 md:h-16 rounded-full border-4 border-black shadow-lg"
									style={{ backgroundColor: color || "transparent" }}
								/>
								<span className="text-xs font-medium text-gray-600">
									Slot {index + 1}
								</span>
							</div>
						))}
					</div>
					<div className="text-center text-sm text-gray-600">
						Code:{" "}
						{secretCode
							.map((c) => (c ? c.charAt(0).toUpperCase() : "?"))
							.join(" - ")}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
