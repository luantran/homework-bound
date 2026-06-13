import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";

export default function Layout() {
  return (
    <Flex h="100vh">
      <Box w="200px" borderRightWidth="1px" p={4}>
        <Text fontWeight="bold" fontSize="lg" mb={6}>
          HomeworkBound
        </Text>
        <Stack gap={1}>
          {[
            { to: "/", label: "Home" },
            { to: "/exercises", label: "Exercises" },
            { to: "/worksheets", label: "Worksheets" },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {({ isActive }) => (
                <Box
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={isActive ? "blue.50" : "transparent"}
                  color={isActive ? "blue.600" : "inherit"}
                  fontWeight={isActive ? "medium" : "normal"}
                  _hover={{ bg: "gray.100" }}
                  fontSize="sm"
                >
                  {label}
                </Box>
              )}
            </NavLink>
          ))}
        </Stack>
      </Box>
      <Box flex={1} p={6} overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  );
}
