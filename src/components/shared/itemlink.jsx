import { ChevronRightIcon, Map } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

// tilføj antal ventende stop og tid til klar i ItemDescription
// kald til backend for at hente ruteinformation og opdatere ItemDescription dynamisk

export function ItemLink() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="outline" render={<a href="#"><ItemContent>
          <Map className="size-4" />
          <ItemTitle>Se dagens rute</ItemTitle>
          <ItemDescription>
            7 ventende stop · klar nu
          </ItemDescription>
        </ItemContent><ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions></a>} />
    </div>
  )
}
