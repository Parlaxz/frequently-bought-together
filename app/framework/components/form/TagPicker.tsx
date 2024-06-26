import {
    LegacyStack,
    Tag,
    Listbox,
    EmptySearchResult,
    Combobox,
    Text,
    AutoSelection,
} from "@shopify/polaris";
import { useState, useCallback, useMemo } from "react";

function TagPicker({
    tags,
    selectedTags,
    defaultValue = [],
    onChange,
}: {
    tags: string[];
    selectedTags: string[];
    defaultValue?: string[];
    onChange: any;
}) {
    const setSelectedTags = useCallback(
        (tags: string[]) => {
            onChange(tags);
        },
        [onChange],
    );
    const [value, setValue] = useState("");
    const [suggestion, setSuggestion] = useState("");
    console.log("value", value);
    const handleActiveOptionChange = useCallback(
        (activeOption: string) => {
            const activeOptionIsAction = activeOption === value;

            if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
                setSuggestion(activeOption);
            } else {
                setSuggestion("");
            }
        },
        [value, selectedTags],
    );
    const updateSelection = useCallback(
        (selected: string) => {
            const nextSelectedTags = new Set([...selectedTags]);

            if (nextSelectedTags.has(selected)) {
                nextSelectedTags.delete(selected);
            } else {
                nextSelectedTags.add(selected);
            }
            setSelectedTags([...nextSelectedTags]);
            setValue("");
            setSuggestion("");
        },
        [selectedTags],
    );

    const removeTag = useCallback(
        (tag: string) => () => {
            updateSelection(tag);
        },
        [updateSelection],
    );

    const getAllTags = useCallback(() => {
        const savedTags = tags;
        return [...new Set([...savedTags, ...selectedTags].sort())];
    }, [selectedTags]);

    const formatOptionText = useCallback(
        (option: string) => {
            const trimValue = value.trim().toLocaleLowerCase();
            const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

            if (!value || matchIndex === -1) return option;

            const start = option.slice(0, matchIndex);
            const highlight = option.slice(
                matchIndex,
                matchIndex + trimValue.length,
            );
            const end = option.slice(
                matchIndex + trimValue.length,
                option.length,
            );

            return (
                <p>
                    {start}
                    <Text fontWeight="bold" as="span">
                        {highlight}
                    </Text>
                    {end}
                </p>
            );
        },
        [value],
    );

    const escapeSpecialRegExCharacters = useCallback(
        (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        [],
    );

    const options = useMemo(() => {
        let list;
        const allTags = getAllTags();
        const filterRegex = new RegExp(
            escapeSpecialRegExCharacters(value),
            "i",
        );

        if (value) {
            list = allTags.filter((tag) => tag.match(filterRegex));
        } else {
            list = allTags;
        }

        return [...list];
    }, [value, getAllTags, escapeSpecialRegExCharacters]);

    const verticalContentMarkup =
        selectedTags.length > 0 ? (
            <LegacyStack spacing="extraTight" alignment="center">
                {selectedTags.map((tag) => (
                    <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
                        {tag}
                    </Tag>
                ))}
            </LegacyStack>
        ) : null;

    const optionMarkup =
        options.length > 0
            ? options.map((option) => {
                  return (
                      <Listbox.Option
                          key={option}
                          value={option}
                          selected={selectedTags.includes(option)}
                          accessibilityLabel={option}
                      >
                          <Listbox.TextOption
                              selected={selectedTags.includes(option)}
                          >
                              {formatOptionText(option)}
                          </Listbox.TextOption>
                      </Listbox.Option>
                  );
              })
            : null;

    const noResults = value && !getAllTags().includes(value);

    const actionMarkup = noResults ? (
        <Listbox.Action value={value}>{`Add "${value}"`}</Listbox.Action>
    ) : null;

    const emptyStateMarkup = optionMarkup ? null : (
        <EmptySearchResult
            title=""
            description={`No tags found matching "${value}"`}
        />
    );

    const listboxMarkup =
        optionMarkup || actionMarkup || emptyStateMarkup ? (
            <Listbox
                autoSelection={AutoSelection.None}
                onSelect={updateSelection}
                onActiveOptionChange={handleActiveOptionChange}
            >
                {actionMarkup}
                {optionMarkup}
            </Listbox>
        ) : null;

    return (
        <div>
            <Combobox
                allowMultiple
                activator={
                    <Combobox.TextField
                        autoComplete="off"
                        label="Search tags"
                        labelHidden
                        value={value}
                        suggestion={suggestion}
                        placeholder="Search tags"
                        verticalContent={verticalContentMarkup}
                        onChange={setValue}
                    />
                }
            >
                {listboxMarkup}
            </Combobox>
        </div>
    );
}
//needs try catch
export const getAllTags = async (storefront: any) => {
    const tags: string[] = [];

    try {
        let response = await storefront.graphql(`
                #graphql
         query {
                productTags(first: 250) {
                  edges {
                    node 
                  }
                  pageInfo{
                    hasNextPage
                    endCursor
                  }
                }
              }
        `);

        let responseData = await response.json();

        responseData.data.productTags.edges.forEach((tag: any) => {
            tags.push(tag.node);
        });
        while (responseData.data.productTags.pageInfo.hasNextPage) {
            const cursor = response.data.productTags.pageInfo.endCursor;
            response = await storefront.graphql(`
            {
                productTags(first: 250, after: "${cursor}") {
                  edges {
                    node {
                      name
                    }
                  }
                  pageInfo{
                    hasNextPage
                  }
                }
              }
            `);
            responseData = await response.json();
            responseData.data.productTags.edges.forEach((tag: any) => {
                tags.push(tag.node);
            });
        }
    } catch (e) {
        console.error("Error fetching tags\n Error:", e);
    }
    return tags;
};

export default TagPicker;
