import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface RoleAssignmentDialogProps {
	open: boolean;
	codeMakerName: string;
	codeBreakerName: string;
	isAnimating: boolean;
}

export function RoleAssignmentDialog({
	open,
	codeMakerName,
	codeBreakerName,
	isAnimating,
}: RoleAssignmentDialogProps) {
	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Assigning Roles...</DialogTitle>
					<DialogDescription>
						Randomly selecting Code Maker and Code Breaker
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4">
					{isAnimating ? (
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
							<p className="text-lg font-medium text-gray-600">
								Shuffling roles...
							</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-500">
								<p className="text-sm font-medium text-gray-600 mb-1">
									Code Maker
								</p>
								<p className="text-2xl font-bold text-purple-700">
									{codeMakerName}
								</p>
							</div>
							<div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
								<p className="text-sm font-medium text-gray-600 mb-1">
									Code Breaker
								</p>
								<p className="text-2xl font-bold text-blue-700">
									{codeBreakerName}
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
