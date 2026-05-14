import { ChevronRightIcon, Map } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export default function ItemLink({ title, href, description, status } = {} ) {
    return( 
    <div className="flex max-w-md flex-col gap-4">
      <Item variant="outline" render={<a href={href}><ItemContent>
          <ItemTitle> 
            <Map className="size-4" /> 
            {title}
          </ItemTitle>

          <ItemDescription>
            { status ? `${description} · ${status}` : description }
          </ItemDescription>
        </ItemContent></a>} />
    </div>
      )
  } 
