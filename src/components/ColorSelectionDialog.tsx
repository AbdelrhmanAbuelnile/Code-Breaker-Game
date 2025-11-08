import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ColorSelectionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	colors: string[];
	onSelectColor: (color: string, row: number, col: number) => void;
	position: { row: number; col: number } | null;
	playerType: "codebreaker" | "codemaker";
}

export function ColorSelectionDialog({
	open,
	onOpenChange,
	colors,
	onSelectColor,
	position,
	playerType,
}: ColorSelectionDialogProps) {
	if (!position) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						Select Color for{" "}
						{playerType === "codebreaker" ? "Code Breaker" : "Code Maker"}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="text-sm text-gray-600">
						Position: Row {position.row + 1}, Column {position.col + 1}
					</div>
					<div className="grid grid-cols-2 gap-4">
						{colors.map((color) => (
							<button
								key={color}
								onClick={() => {
									onSelectColor(color, position.row, position.col);
									onOpenChange(false);
								}}
								className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
							>
								<div
									className="w-16 h-16 rounded-full border-2 border-black shadow-md"
									style={{ backgroundColor: color }}
								/>
								<span className="text-sm font-medium capitalize">{color}</span>
							</button>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
